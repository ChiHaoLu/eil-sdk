import { Address, Call } from 'viem'

import { BaseAction, BatchBuilder, FunctionCall, SdkVoucherRequest, toAddress } from '../index.js'
import { NATIVE_ETH } from '../types/index.js'

const FEE_DENOMINATOR = 10_000n

/**
 * Calculate the amount including the max fee.
 * Fees are always defined as percentage from the first token in the voucher request.
 * @param amount The transfer amount
 * @param maxFeePercent The maximum fee percentage (e.g., 0.01 for 1%)
 * @returns The total amount (transfer amount + fee)
 */
function calculateAmountWithFee(
  amount: bigint,
  maxFeePercent: number
): bigint {
  if (maxFeePercent <= 0) {
    return amount
  }

  const maxFeePercentNumerator = BigInt(Math.floor(maxFeePercent * 10_000))
  // Use ceiling division to ensure we have enough
  const feeAmount = (amount * maxFeePercentNumerator + FEE_DENOMINATOR - 1n) / FEE_DENOMINATOR
  return amount + feeAmount
}

/**
 * The internal class defining an action to lock the user deposit for the specified {@link SdkVoucherRequest}.
 */
export class VoucherRequestAction implements BaseAction {
  private nativeAmount: bigint = 0n

  constructor(
    readonly voucherRequest: SdkVoucherRequest
  ) {
    this.voucherRequest.tokens.forEach((asset, index) => {
      if (asset.token === NATIVE_ETH) {
        if (index !== 0) {
          throw new Error(`Native ETH can only be used as the first asset in a voucher request`)
        }
        if (typeof asset.amount !== 'bigint') {
          throw new Error(`When using a native currency (ETH), the 'amount' parameter must be a fixed bigint value`)
        }
        this.nativeAmount = asset.amount
      }
    })
  }

  async encodeCall(batch: BatchBuilder): Promise<Array<Call | FunctionCall>> {
    const paymasterAddr: Address = batch.config.paymasters.addressOn(batch.chainId)
    //fill in source chainid.
    const voucherRequest = batch.getVoucherInternalInfo(this.voucherRequest)?.voucherRequest
    if (voucherRequest == null) {
      throw new Error(`Voucher request ${this.voucherRequest} not found in action builder`)
    }
    const calls: FunctionCall[] = []
    const chainId = batch.chainId

    // Get fee config to include fee in amount (approve for ERC20, value for ETH)
    // Fees are always defined as percentage from the first token in the voucher request.
    const feeConfig = batch.config.input.feeConfig
    const maxFeePercent = feeConfig?.maxFeePercent ?? 0

    // Calculate the value to send for native ETH (including fee if ETH is the first token)
    // Note: ETH can only be the first token (index 0), so if nativeAmount > 0, fee applies
    let nativeValue = this.nativeAmount
    if (this.nativeAmount > 0n && maxFeePercent > 0) {
      nativeValue = calculateAmountWithFee(this.nativeAmount, maxFeePercent)
    }

    //add "approve" for each token we lock, including fee for the first ERC20 token
    this.voucherRequest.tokens.forEach((asset, index) => {
      const tokenAddress = toAddress(chainId, asset.token)
      if (tokenAddress === NATIVE_ETH) {
        return // Skip native ETH - no approval needed
      }

      // Fee is applied to the first token (index 0)
      // If first token is ETH, then index 0 ERC20 won't exist; fee is already in nativeValue
      const isFirstFeeToken = index === 0
      let approveAmount = asset.amount

      if (isFirstFeeToken && typeof asset.amount === 'bigint') {
        approveAmount = calculateAmountWithFee(asset.amount, maxFeePercent)
      }

      calls.push({
        target: asset.token,
        functionName: 'approve',
        args: [paymasterAddr, approveAmount],
      })
    })

    calls.push({
      target: batch.config.paymasters,
      functionName: 'lockUserDeposit',
      value: nativeValue,
      args: [voucherRequest],
    })

    return calls
  }
}
