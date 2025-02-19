import { namehash }             from '@ensdomains/ensjs/utils/normalise';
import { utils }                from 'ethers';
import nock                     from 'nock';
import { Version }              from '../src/base';
import { ADDRESS_NAME_WRAPPER } from '../src/config';
import { Metadata }             from '../src/service/metadata';
import getNetwork               from '../src/service/network';
import { decodeFuses, getWrapperState }          from '../src/utils/fuse';
import {
  GET_DOMAINS,
  GET_REGISTRATIONS,
  GET_WRAPPED_DOMAIN,
} from '../src/service/subgraph';
import {
  DomainResponse,
  MockEntryBody,
  RegistrationResponse,
  WrappedDomainResponse,
} from './interface';

const { SUBGRAPH_URL: subgraph_url } = getNetwork('hyperspace');
const SUBGRAPH_URL = new URL(subgraph_url);
const SUBGRAPH_PATH = SUBGRAPH_URL.pathname + SUBGRAPH_URL.search;

export class MockEntry {
  public name: string;
  public namehash: string;
  public domainResponse!: DomainResponse | null;
  public registrationResponse: RegistrationResponse | null = null;
  public wrappedDomainResponse: WrappedDomainResponse | null = null;
  public expect: Metadata | string;
  constructor({
    name,
    hasImageKey = null,
    image,
    owner = '0x97ba55f61345665cf08c4233b9d6e61051a43b18',
    parent = '0x78f6b1389af563cc5c91f234ea46b055e49658d8b999eeb9e0baef7dbbc93fdb',
    resolver = null,
    registration = false,
    statusCode = 200,
    unknown = false,
    registered = true,
    version = Version.v2,
    persist = false,
  }: MockEntryBody) {
    if (!name) throw Error('There must be a valid name.');
    this.name = name;
    this.namehash = namehash(name);

    if (!registered) {
      this.expect = 'No results found.';
      nock(SUBGRAPH_URL.origin)
        .post(SUBGRAPH_PATH, {
          query: GET_DOMAINS,
          variables: {
            tokenId: this.namehash,
          },
          operationName: 'getDomains',
        })
        .reply(statusCode, {
          data: null,
        })
        .persist(persist);
      return;
    }

    if (unknown) {
      const { url, ...unknownMetadata } = new Metadata({
        name: 'unknown.name',
        description: 'Unknown FNS name',
        created_date: 1580346653000,
        tokenId: '',
        version: Version.v1,
      });
      this.expect = JSON.parse(JSON.stringify(unknownMetadata));
      nock(SUBGRAPH_URL.origin)
        .post(SUBGRAPH_PATH, {
          query: GET_DOMAINS,
          variables: {
            tokenId: this.namehash,
          },
          operationName: 'getDomains',
        })
        .reply(statusCode, {
          data: { domain: {} },
        })
        .persist(persist);
      return;
    }

    const randomDate = this.getRandomDate();
    const registrationDate = +new Date() - 157680000000;
    const expiryDate = +new Date() + 31536000000;
    const labelName = name.split('.')[0];
    const labelhash = utils.keccak256(utils.toUtf8Bytes(labelName));
    const _metadata = new Metadata({
      name,
      created_date: +randomDate,
      tokenId: this.namehash,
      version,
    });

    (_metadata as Metadata).setImage(
      `https://metadata.fildomains.com/hyperspace/${ADDRESS_NAME_WRAPPER}/${this.namehash}/image`
    );
    (_metadata as Metadata).setBackground(
      `https://metadata.fildomains.com/hyperspace/avatar/${name}`
    );

    this.domainResponse = {
      domain: {
        createdAt: randomDate,
        id: this.namehash,
        labelName,
        labelhash,
        name,
        owner: { id: owner },
        parent: {
          id: parent,
        },
        resolver,
        hasImageKey,
      },
    };

    if (registration) {
      this.registrationResponse = {
        registrations: [
          {
            expiryDate: expiryDate.toString(),
            labelName: name,
            registrationDate: registrationDate.toString(),
          },
        ],
      };
      _metadata.addAttribute({
        trait_type: 'Registration Date',
        display_type: 'date',
        value: registrationDate * 1000,
      });
      _metadata.addAttribute({
        trait_type: 'Expiration Date',
        display_type: 'date',
        value: expiryDate * 1000,
      });

      nock(SUBGRAPH_URL.origin)
        .post(SUBGRAPH_PATH, {
          query: GET_REGISTRATIONS,
          variables: {
            labelhash,
          },
          operationName: 'getRegistration',
        })
        .reply(statusCode, {
          data: this.registrationResponse,
        })
        .persist(persist);
    }

    if (version === Version.v2) {
      const fuses = 1;
      this.wrappedDomainResponse = {
        wrappedDomain: {
          fuses,
          expiryDate: expiryDate,
        },
      };

      const decodedFuses = decodeFuses(fuses);

      _metadata.addAttribute({
        trait_type: 'Namewrapper Fuse States',
        display_type: 'object',
        value: decodedFuses,
      });
      _metadata.addAttribute({
        trait_type: 'Namewrapper Expiry Date',
        display_type: 'date',
        value: expiryDate * 1000,
      });

      _metadata.addAttribute({
        trait_type: 'Namewrapper State',
        display_type: 'string',
        value: getWrapperState(decodedFuses),
      });

      nock(SUBGRAPH_URL.origin)
        .post(SUBGRAPH_PATH, {
          query: GET_WRAPPED_DOMAIN,
          variables: {
            tokenId: this.namehash,
          },
          operationName: 'getWrappedDomain',
        })
        .reply(statusCode, {
          data: this.wrappedDomainResponse,
        })
        .persist(persist);
    }

    this.expect = JSON.parse(JSON.stringify(_metadata)); //todo: find better serialization option

    nock(SUBGRAPH_URL.origin)
      .post(SUBGRAPH_PATH, {
        query: GET_DOMAINS,
        variables: {
          tokenId: this.namehash,
        },
        operationName: 'getDomains',
      })
      .reply(statusCode, {
        data: this.domainResponse,
      })
      .persist(persist);
  }

  getRandomDate(
    start: Date = new Date(2017, 3, 4),
    end: Date = new Date()
  ): string {
    return (
      new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      ).getTime() / 1000
    ).toFixed(0);
  }
}
