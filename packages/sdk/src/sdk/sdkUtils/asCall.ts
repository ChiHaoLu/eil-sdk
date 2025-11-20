// encode as a static call: must not have dynamic parameters
import {
  FunctionCall,
  getFunctionCallAbi,
  hasDynamicArguments,
  isCall,
  toAddress
} from '../types/index.js'
import { Call, encodeFunctionData } from 'viem'
import { assert } from './SdkUtils.js'

export function asCall (chainId: bigint, call: Call | FunctionCall): Call {
  assert(!hasDynamicArguments(call), `asCall: cannot encode dynamic call: ${call} as static`)
  if (isCall(call)) {
    return {
      to: call.to,
      data: call.data,
      value: call.value ?? 0n,
    }
  } else {
    const call1 = call as FunctionCall
    let callArgs = call1.args ?? []
    return {
      to: toAddress(chainId, call1.target),
      data: encodeFunctionData({
        abi: getFunctionCallAbi(call1),
        functionName: call1.functionName,
        args: callArgs.map(arg => resolveMultiChainAddress(chainId, arg))
      }),
      value: call1.value ?? 0n,
    }
  }
}

//if "arg" is multichain contract (has "addressOn"), resolve it to the address on the given chainId.
// otherwise, return the argument as is.
function resolveMultiChainAddress (chainId: bigint, arg: any): any {
  if (typeof arg === 'object') {
    if ('addressOn' in arg) {
      return arg.addressOn(chainId)
    }
    if ('address' in arg) {
      return arg.address
    }
  }
  return arg
}
