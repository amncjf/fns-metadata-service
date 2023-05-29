import { gql } from 'graphql-request';

const FIL_NAMEHASH =
  '0x78f6b1389af563cc5c91f234ea46b055e49658d8b999eeb9e0baef7dbbc93fdb';

export const GET_DOMAINS = gql`
  query getDomains($tokenId: String!) {
    domain(id: $tokenId) {
      id
      labelhash
      name
      createdAt
      parent {
        id
      }
      resolver {
        texts
        address
      }
    }
  }
`;

export const GET_DOMAINS_BY_LABELHASH = gql`
  query getDomains($tokenId: String!) {
    domains(
      where: {
        parent: "${FIL_NAMEHASH}",
        labelhash: $tokenId
      }
    ) {
      id
      labelhash
      name
      createdAt
      parent {
        id
      }
      resolver {
        texts
        address
      }
    }
  }
`;

export const GET_REGISTRATIONS = gql`
  query getRegistration($labelhash: String!) {
    registrations(
      orderBy: registrationDate
      orderDirection: desc
      where: { id: $labelhash }
    ) {
      labelName
      registrationDate
      expiryDate
    }
  }
`;

export const GET_WRAPPED_DOMAIN = gql`
query getWrappedDomain($tokenId: String!) {
  wrappedDomain(id: $tokenId) {
    id
    owner {
      id
    }
    fuses
    expiryDate
    domain {
      name
    }
  }
}
`;
