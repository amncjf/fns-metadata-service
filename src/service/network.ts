import { ethers } from 'ethers';
import { UnsupportedNetwork } from '../base';
import {
  NODE_PROVIDER,
  NODE_PROVIDER_URL,
  NODE_PROVIDER_URL_CF,
  NODE_PROVIDER_URL_GOERLI,
} from '../config';

const NODE_PROVIDERS = {
  INFURA    : 'INFURA',
  CLOUDFLARE: 'CLOUDFLARE',
  GOOGLE    : 'GOOGLE',
  GETH      : 'GETH'
};

export const NETWORK = {
  LOCAL  : 'local',
  RINKEBY: 'rinkeby',
  ROPSTEN: 'ropsten',
  GOERLI : 'goerli',
  MAINNET: 'mainnet',
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

  switch (providerName.toUpperCase()) {
    case NODE_PROVIDERS.INFURA:
      return `${api.replace('https://', `https://${network}.`)}`;
    case NODE_PROVIDERS.CLOUDFLARE:
      return `${api}/${network}`;
    case NODE_PROVIDERS.GOOGLE:
      if (network === NETWORK.MAINNET) return api;
      if (network === NETWORK.GOERLI) return NODE_PROVIDER_URL_GOERLI;
      return `${NODE_PROVIDER_URL_CF}/${network}`;
    case NODE_PROVIDERS.GETH:
      return api;
    default:
      throw Error('');
  }
}

export default function getNetwork(network: NetworkName): {
  WEB3_URL: string;
  SUBGRAPH_URL: string;
  provider: ethers.providers.BaseProvider;
} {
  // currently subgraphs used under this function are outdated,
  // we will have namewrapper support and more attributes when latest subgraph goes to production
  let SUBGRAPH_URL: string;
  switch (network) {
    case NETWORK.LOCAL:
      SUBGRAPH_URL = 'http://127.0.0.1:8000/subgraphs/name/graphprotocol/ens';
      break;
    case NETWORK.FILECOIN:
      SUBGRAPH_URL =
        'https://api.fildomains.com:5678/filecoin';
      break;
    case NETWORK.HYPERSPACE:
      SUBGRAPH_URL =
          'https://api.fildomains.com:5678/hyperspace';
      break;
    case NETWORK.CALIBRATION:
      SUBGRAPH_URL =
          'https://api.fildomains.com:5678/calibration';
      break;
    case NETWORK.ROPSTEN:
      SUBGRAPH_URL =
        'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten';
      break;
    case NETWORK.GOERLI:
      SUBGRAPH_URL =
        'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli';
      break;
    case NETWORK.MAINNET:
      SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';
      break;
    default:
      throw new UnsupportedNetwork(`Unknown network '${network}'`, 501);
  }

  const WEB3_URL = getWeb3URL(NODE_PROVIDER, NODE_PROVIDER_URL, network);

  // add source param at the end for better request measurability
  SUBGRAPH_URL = SUBGRAPH_URL + '?source=ens-metadata';

  const provider = new ethers.providers.StaticJsonRpcProvider(WEB3_URL);
  return { WEB3_URL, SUBGRAPH_URL, provider };
}
