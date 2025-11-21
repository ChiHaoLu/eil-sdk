import { parseEventLogs, PublicClient } from 'viem'

import ICrossChainPaymaster
  from '@eil-protocol/contracts/artifacts/src/ICrossChainPaymaster.sol/ICrossChainPaymaster.json' with { type: 'json' }
import TestERC20 from '@eil-protocol/contracts/artifacts/src/test/TestERC20.sol/TestERC20.json' with { type: 'json' }
import { EntryPointMeta } from '../abitypes/abiTypes.js'

export async function dumpLogs (client: PublicClient) {

  const block: any = await client.getBlock({
    blockTag: 'latest',
  })
  const txhash: any = block.transactions[0]
  const rcpt: any = await client.getTransactionReceipt({
    hash: txhash,
  })

  console.log(parseEventLogs({
    abi: [...TestERC20.abi, ...EntryPointMeta.abi, ...ICrossChainPaymaster.abi],
    logs: rcpt.logs
  }).map((x: any) => ({ e: x.eventName, args: x.args, addr: x.address })))

}
