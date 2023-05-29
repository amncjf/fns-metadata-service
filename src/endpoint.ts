import { Express } from 'express';

import { fnsMetadata } from './controller/fnsMetadata';
import { fnsImage } from './controller/fnsImage';
import { fnsRasterize } from './controller/fnsRasterize';
import { avatarMetadata } from './controller/avatarMetadata';
import { avatarImage } from './controller/avatarImage';
import { queryNFTep } from './controller/queryNFT';
import { preview } from './controller/preview';

export default function (app: Express) {
  // #swagger.ignore = true
  app.get('/', (_req, res) => {
    res.send('Well done mate To see more go to "/docs"!');
  });

  app.get(
    '/:networkName/:contractAddress(0x[a-fA-F0-9]{40})/:tokenId',
    fnsMetadata
  );

  app.get(
    '/:networkName/:contractAddress(0x[a-fA-F0-9]{40})/:tokenId/image',
    fnsImage
  );

  app.get(
    '/:networkName/:contractAddress(0x[a-fA-F0-9]{40})/:tokenId/rasterize',
    fnsRasterize
  );

  app.get('/:networkName/avatar/:name/meta', avatarMetadata);

  app.get('/:networkName/avatar/:name', avatarImage);

  app.get('/queryNFT', queryNFTep);

  app.get('/preview/:name', preview);
}
