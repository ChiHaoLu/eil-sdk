import { entryPoint08Abi } from 'viem/account-abstraction'

import CrossChainPaymasterMetadata
  from '@eil-protocol/contracts/artifacts/src/CrossChainPaymaster.sol/CrossChainPaymaster.json' with { type: 'json' }
import ICrossChainPaymaster
  from '@eil-protocol/contracts/artifacts/src/ICrossChainPaymaster.sol/ICrossChainPaymaster.json' with { type: 'json' }
import L1AtomicSwapStakeManager
  from '@eil-protocol/contracts/artifacts/src/L1AtomicSwapStakeManager.sol/L1AtomicSwapStakeManager.json' with { type: 'json' }
import SimplePaymasterMeta
  from '@eil-protocol/contracts/artifacts/src/SimplePaymaster.sol/SimplePaymaster.json' with { type: 'json' }
import RuntimeVarsHelper
  from '@eil-protocol/contracts/artifacts/src/common/RuntimeVarsHelper.sol/RuntimeVarsHelper.json' with { type: 'json' }
import AtomicSwapTypes
  from '@eil-protocol/contracts/artifacts/src/common/utils/AtomicSwapTypes.sol/AtomicSwapTypes.json' with { type: 'json' }
import XlpSelectionHelper
  from '@eil-protocol/contracts/artifacts/src/common/utils/XlpSelectionHelper.sol/XlpSelectionHelper.json' with { type: 'json' }
import CreateXMetadata
  from '@eil-protocol/contracts/artifacts/src/createx/CreateX.sol/CreateX.json' with { type: 'json' }
import TestERC20Meta
  from '@eil-protocol/contracts/artifacts/src/test/TestERC20.sol/TestERC20.json' with { type: 'json' }

const EntryPointMeta = {
  abi: entryPoint08Abi
}

// global metadata. used for decoding errors.
const allMetaData: any[] = [
  EntryPointMeta,
  ICrossChainPaymaster,
  L1AtomicSwapStakeManager,
  CrossChainPaymasterMetadata,
  CreateXMetadata,
  RuntimeVarsHelper,
  SimplePaymasterMeta,
  AtomicSwapTypes,
  TestERC20Meta,
]

export {
  allMetaData,
  AtomicSwapTypes,
  CreateXMetadata,
  CrossChainPaymasterMetadata,
  EntryPointMeta,
  ICrossChainPaymaster,
  L1AtomicSwapStakeManager,
  TestERC20Meta,
  RuntimeVarsHelper,
  SimplePaymasterMeta,
  XlpSelectionHelper
}
