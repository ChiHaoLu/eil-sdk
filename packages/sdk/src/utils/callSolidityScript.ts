
import {
  concatHex,
  decodeFunctionResult,
  encodeAbiParameters,
  Hex,
  parseAbi,
  PublicClient
} from 'viem'
import { assert } from '../sdk/index.js'

/**
 * Helper to call a Solidity script encoded in a contract constructor.
 * The constructor should end with ABI-encoded params:
 * ```solidity
 * constructor(uint256 param) {
 *   bytes memory returnData = abi.encode("hello", param);
 *   assembly {
 *     return(add(returnData, 0x20), mload(returnData))
 *   }
 * }
 * ```
 * The above script contract can be called with:
 * ```ts
 * const { str, param } = await callSolidityScript(client, MyScript, [42], 'string hello, uint256 param')
 * ```
 */
export async function callSolidityScript (
  client: PublicClient,
  contractMeta: any,
  params: any[],
  returnTypeFunc: string
): Promise<any> {
  assert(contractMeta.abi, 'No ABI found in contract metadata')
  assert(contractMeta.bytecode, 'No bytecode found in contract metadata')

  const constructorAbi: { inputs: any[] } | undefined = contractMeta.abi.find((item: any) => item.type === 'constructor')
  assert(constructorAbi!=null, 'No constructor found in ABI')

  const encodedParams: Hex = encodeAbiParameters(constructorAbi.inputs, params)
  const { data } = await client.call({
    data: concatHex([contractMeta.bytecode as Hex, encodedParams])
  })
  if (data == null) {
    throw new Error('Solidity script returned no data')
  }

  const directEntry: any = contractMeta.abi.find((item: any) => item.name === returnTypeFunc)
  const abi: any[] = directEntry != null
    ? contractMeta.abi
    : parseAbi([`function f() returns (${returnTypeFunc})`])
  const functionName: string = directEntry != null ? returnTypeFunc : 'f'

  return decodeFunctionResult({
    abi,
    functionName,
    data
  })
}
