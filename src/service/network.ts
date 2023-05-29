import { ethers } from 'ethers';
import { UnsupportedNetwork } from '../base';
import {
  NODE_PROVIDER,
  NODE_PROVIDER_URL,
  NODE_PROVIDER_URL_CF,
  NODE_PROVIDER_URL_GOERLI,
} from '../config';
import {Networkish} from "@ethersproject/networks";

const NODE_PROVIDERS = {
  INFURA    : 'INFURA',
  CLOUDFLARE: 'CLOUDFLARE',
  GOOGLE    : 'GOOGLE',
  GETH      : 'GETH'
};

export const NETWORK = {
  LOCAL  : 'local',
  FILECOIN: 'filecoin',
  HYPERSPACE: 'hyperspace',
  CALIBRATION: 'calibration',
} as const;

export type NetworkName = typeof NETWORK[keyof typeof NETWORK];

function getWeb3URL(
  providerName: string,
  api: string,
  network: NetworkName
): string {
  if (network === 'filecoin') {
    return 'https://api.node.glif.io'
  } else if (network === 'hyperspace') {
    return 'https://api.hyperspace.node.glif.io/rpc/v1'
  } else if (network === 'calibration') {
    return 'https://api.calibration.node.glif.io/rpc/v1'
  }

  throw Error('');
}

export default function getNetwork(network: NetworkName): {
  WEB3_URL: string;
  SUBGRAPH_URL: string;
  provider: ethers.providers.BaseProvider;
} {
  // currently subgraphs used under this function are outdated,
  // we will have namewrapper support and more attributes when latest subgraph goes to production
  let SUBGRAPH_URL: string;
  let networkish: Networkish | undefined = undefined;
  switch (network) {
    case NETWORK.LOCAL:
      SUBGRAPH_URL = 'http://localhost:5678/${network}';
      break;
    case NETWORK.FILECOIN:
      SUBGRAPH_URL =
        'https://api.fildomains.com:5678/filecoin';
      networkish = {
        name: network,
        chainId: 314,
        ensAddress: '0x0000000000Ec577Ad90e99CA7817e976e953C3bd',
      }
      break;
    case NETWORK.HYPERSPACE:
      SUBGRAPH_URL =
          'https://api.fildomains.com:5678/hyperspace';
      networkish = {
        name: network,
        chainId: 3141,
        ensAddress: '0x0000000000Ec577Ad90e99CA7817e976e953C3bd',
      }
      break;
    case NETWORK.CALIBRATION:
      SUBGRAPH_URL =
          'https://api.fildomains.com:5678/calibration';
      networkish = {
        name: network,
        chainId: 314159,
        ensAddress: '0x0000000000Ec577Ad90e99CA7817e976e953C3bd',
      }
      break;
    default:
      throw new UnsupportedNetwork(`Unknown network '${network}'`, 501);
  }

  const WEB3_URL = getWeb3URL(NODE_PROVIDER, NODE_PROVIDER_URL, network);

  // add source param at the end for better request measurability
  SUBGRAPH_URL = SUBGRAPH_URL + '?source=fns-metadata';
  const provider = new ethers.providers.StaticJsonRpcProvider(WEB3_URL, networkish);
  return { WEB3_URL, SUBGRAPH_URL, provider };
}
