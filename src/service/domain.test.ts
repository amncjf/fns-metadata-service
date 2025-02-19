import avaTest, { ExecutionContext, TestFn } from 'ava';
import { ethers } from 'ethers';
import nock from 'nock';
import { nockProvider } from '../../mock/helper';
import { TestContext } from '../../mock/interface';
import { NamehashMismatchError, Version } from '../base';
import { ADDRESS_ETH_REGISTRAR, ADDRESS_ETH_REGISTRY } from '../config';
import { getDomain } from './domain';
import getNetwork from './network';
import { GET_DOMAINS_BY_LABELHASH, GET_REGISTRATIONS } from './subgraph';

const test = avaTest as TestFn<TestContext>;
const NETWORK = 'hyperspace';
const NETWORKISH = {
  name: 'hyperspace',
  chainId: 3141,
  ensAddress: '0x0000000000Ec577Ad90e99CA7817e976e953C3bd',
}

const { WEB3_URL: web3_url, SUBGRAPH_URL: subgraph_url } = getNetwork(NETWORK);
const WEB3_URL = new URL(web3_url);
const SUBGRAPH_URL = new URL(subgraph_url);
const SUBGRAPH_PATH = SUBGRAPH_URL.pathname + SUBGRAPH_URL.search;

test.before(async (t: ExecutionContext<TestContext>) => {
  nock.disableNetConnect();

  nockProvider(WEB3_URL, 'eth_chainId', [], {
    id: 1,
    jsonrpc: '2.0',
    result: '0x01', // mainnet
  });
  nockProvider(WEB3_URL, 'net_version', [], {
    jsonrpc: '2.0',
    id: 1,
    result: '1',
  });
  nockProvider(
    WEB3_URL,
    'eth_call',
    [
      {
        to: ADDRESS_ETH_REGISTRAR.toLowerCase(),
        data: /^.*$/,
      },
      'latest',
    ],
    {
      result:
        '0x000000000000000000000000f96e15e7ea2b1d862fb8c400c9e64dccc6d56ba4',
    }
  );
  nockProvider(
    WEB3_URL,
    'eth_call',
    [
      {
        to: ADDRESS_ETH_REGISTRY.toLowerCase(),
        data: '0x0178b8bfb9fab6dd33ccdfd1f65ea203855508034652c2e01f585a7b742c3698c0c8d6b1',
      },
      'latest',
    ],
    {
      result:
        '0x0000000000000000000000004d9487c0fa713630a8f3cd8067564a604f0d2989',
    }
  );

  // fake vitalik.fil with nullifier
  nock(SUBGRAPH_URL.origin)
    .post(SUBGRAPH_PATH, {
      query: GET_DOMAINS_BY_LABELHASH,
      variables: {
        tokenId:
          '0x3581397a478dcebdc1ee778deed625697f624c6f7dbed8bb7f780a6ac094b772',
      },
      operationName: 'getDomains',
    })
    .reply(200, {
      data: {
        domains: [
          {
            id: '0xa4290dde50b30e173c50253d179727e9dc1ef34a81cc346cfda9431e45035e6a',
            labelhash:
              '0x3581397a478dcebdc1ee778deed625697f624c6f7dbed8bb7f780a6ac094b772',
            name: 'vitalik.fil',
            createdAt: '1673268731',
            parent: {
              id: '0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae',
            },
            resolver: null,
          },
        ],
      },
    });

  // original vitalik.fil
  nock(SUBGRAPH_URL.origin)
    .post(SUBGRAPH_PATH, {
      query: GET_DOMAINS_BY_LABELHASH,
      variables: {
        tokenId:
          '0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc',
      },
      operationName: 'getDomains',
    })
    .reply(200, {
      data: {
        "domains": [
          {
            "id": "0x90af55c1932e9328258e25e750466a7f47bbb687b6ed9cb205fcabbb4efa52dd",
            "labelhash": "0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc",
            "name": "vitalik.fil",
            "createdAt": "1685086650",
            "parent": {
              "id": "0x78f6b1389af563cc5c91f234ea46b055e49658d8b999eeb9e0baef7dbbc93fdb"
            },
            "resolver": {
              "texts": null,
              "address": "0xd75719e7ca2dddd663911f7d667bf0f1ac54bf1e"
            }
          }
        ]
      },
    });

  nock(SUBGRAPH_URL.origin)
    .post(SUBGRAPH_PATH, {
      query: GET_REGISTRATIONS,
      variables: {
        labelhash:
          '0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc',
      },
      operationName: 'getRegistration',
    })
    .reply(200, {
      data: {
        registrations: [
          {
            labelName: 'vitalik',
            registrationDate: '1581013420',
            expiryDate: '2032977474',
          },
        ],
      },
    });
});

test.after.always((t: ExecutionContext<TestContext>) => {
  nock.enableNetConnect();
});

test('should raise an error if namehash of the name is not match with subgraph', async (t: ExecutionContext<TestContext>) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    WEB3_URL.origin,
    NETWORKISH
  );

  const error: NamehashMismatchError = (await t.throwsAsync(
    () =>
      getDomain(
        provider,
        NETWORK,
        subgraph_url,
        ADDRESS_ETH_REGISTRAR,
        '24200900942460299581294029538738684782160326766579606917767243798520494602098',
        Version.v1,
        false
      ),
    { instanceOf: NamehashMismatchError }
  )) as NamehashMismatchError;
  t.is(
    error.message,
    'TokenID of the query does not match with namehash of vitalik.fil'
  );
  t.is(error.code, 404);
});

test('should return successfully if namehash is matches with subgraph', async (t: ExecutionContext<TestContext>) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    WEB3_URL.origin,
    NETWORKISH
  );

  const domain = await getDomain(
    provider,
    NETWORK,
    subgraph_url,
    ADDRESS_ETH_REGISTRAR,
    '0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc',
    Version.v1,
    false
  );

  t.is(domain.name, 'vitalik.fil');
});
