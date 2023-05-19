## API


### Request
- __network:__ Name of the chain to query for. (filecoin | hyperspace | calibration )
- __contactAddress:__ accepts contractAddress of the NFT which represented by the tokenId
- __NFT - tokenId:__ accepts FNS name or namehash of FNS name in both hex and int format

```
/{network}/{contractAddress}/{tokenId}
```

Request (example)

https://metadata.fildomains.com/filecoin/0x46b7a579eDa54bdF1D2739F439C21EE889633020/12021683011351676866787576003687593997598021892557666729367778369262666928810/

### Response (example)

```json
{
  "is_normalized": true,
  "name": "fildomains.fil",
  "description": "fildomains.fil, an FNS name.",
  "attributes": [{
    "trait_type": "Created Date",
    "display_type": "date",
    "value": 1682180520000
  }, {
    "trait_type": "Length",
    "display_type": "number",
    "value": 10
  }, {
    "trait_type": "Segment Length",
    "display_type": "number",
    "value": 10
  }, {
    "trait_type": "Character Set",
    "display_type": "string",
    "value": "letter"
  }, {
    "trait_type": "Registration Date",
    "display_type": "date",
    "value": 1682180520000
  }, {
    "trait_type": "Expiration Date",
    "display_type": "date",
    "value": 1713716520000
  }, {
    "trait_type": "Namewrapper Fuse States",
    "display_type": "object",
    "value": {
      "parent": {
        "PARENT_CANNOT_CONTROL": true,
        "CAN_EXTEND_EXPIRY": false,
        "IS_DOT_FIL": false,
        "unnamed": {
          "524288": false,
          "1048576": false,
          "2097152": false,
          "4194304": false,
          "8388608": false,
          "16777216": false,
          "33554432": false,
          "67108864": false,
          "134217728": false,
          "268435456": false,
          "536870912": false,
          "1073741824": false,
          "2147483648": false
        }
      },
      "child": {
        "CANNOT_UNWRAP": false,
        "CANNOT_BURN_FUSES": false,
        "CANNOT_TRANSFER": false,
        "CANNOT_SET_RESOLVER": false,
        "CANNOT_SET_TTL": false,
        "CANNOT_CREATE_SUBDOMAIN": false,
        "CANNOT_APPROVE": false,
        "CAN_DO_EVERYTHING": true,
        "unnamed": {
          "128": false,
          "256": false,
          "512": false,
          "1024": false,
          "2048": false,
          "4096": false,
          "8192": false,
          "16384": false,
          "32768": false
        }
      }
    }
  }, {
    "trait_type": "Namewrapper Expiry Date",
    "display_type": "date",
    "value": 1721492520000
  }, {
    "trait_type": "Namewrapper State",
    "display_type": "string",
    "value": "Emancipated"
  }],
  "url": "https://metadata.fildomains.com/name/fildomains.fil",
  "last_request_date": 1684468213350,
  "version": 2,
  "background_image": "https://metadata.fildomains.com/filecoin/avatar/fildomains.fil",
  "image": "https://metadata.fildomains.com/filecoin/0x46b7a579eDa54bdF1D2739F439C21EE889633020/0x1a94080dac56ea3822410a402a581995ec77813c8b74c0668faba55efd5452aa/image",
  "image_url": "https://metadata.fildomains.com/filecoin/0x46b7a579eDa54bdF1D2739F439C21EE889633020/0x1a94080dac56ea3822410a402a581995ec77813c8b74c0668faba55efd5452aa/image"
}

```

More info and list of all endpoints: https://metadata.ens.domains/docs


## How to setup

```
git clone https://github.com/fildomains/fns-metadata-service.git
cd fns-metadata-service
cp .env.org .env // Fill in Vars
yarn
yarn dev
```


## How to deploy

```
yarn deploy
```


## How to test

Regular unit test;
```
yarn test
```

Unit test + coverage;
```
yarn test:cov
```


## Environment Variables

| Name | Description                                     | Default value | Options |
| ---- |-------------------------------------------------| ------------- | ------- |
| HOST | Host (ip/domain) address of the running service | localhost | - | No |
| ENV | Project scope                                   | local | local/prod |
| INAMEWRAPPER | InterfaceId of NameWrapper Contract             | 0x4d6b2f7a | - |
| ADDRESS_ETH_REGISTRAR | Address of FNSBaseRegistrar Contract            | 0x495afaC4f4272f7c747D6910e74430584Ef1f50A | - |
| ADDRESS_NAME_WRAPPER | Address of NameWrapper Contract                 | 0x46b7a579eDa54bdF1D2739F439C21EE889633020 | - |
| WEB3_NODE_URL | Ethereum Node Provider API                      | - | - |
| NODE_PROVIDER | Ethereum Node Provider                          | Cloudflare | Cloudflare/Google/Infura/Local |
| NODE_PROVIDER_URL | Ethereum Node Provider API Endpoint             | - | - |

