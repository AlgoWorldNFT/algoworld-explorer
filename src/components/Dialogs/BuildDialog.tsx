/* eslint-disable @next/next/no-img-element */
/**
 * AlgoWorld Explorer
 * Copyright (C) 2022 AlgoWorld
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useMemo, useState } from 'react';
import formatAmount from '@/utils/formatAmount';
import { FROM_ASSET_PICKER_DIALOG_ID } from './constants';
import { useAppSelector } from '@/redux/store/hooks';
import {
  DialogContentText,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  AWT_ASSET_ID,
  PARIS_ASSET_INDEX,
  WASHINGTON_ASSET_INDEX,
  ROME_ASSET_INDEX,
  NYC_ASSET_INDEX,
} from '@/common/constants';
import { MapAsset } from '@/models/MapAsset';
import { TextureType } from '@/models/TextureType';

type Props = {
  onDepositConfirmed: (object: string) => void;
  onDepositCancelled: () => void;
  depositAsset: MapAsset;
  tilesMap: MapAsset[];
  open: boolean;
};

export const BuildDialog = ({
  onDepositConfirmed,
  onDepositCancelled,
  depositAsset,
  tilesMap,
  open,
}: Props) => {
  const assets = useAppSelector((state) => state.application.assets);
  const chain = useAppSelector((state) => state.application.chain);

  const [selectedobject, setSelectedobject] = useState(`Meadow`);

  const awtAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === AWT_ASSET_ID(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const enough_awt =
    (formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0) >
    depositAsset.cost;

  // PARIS
  //
  const ParisAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === PARIS_ASSET_INDEX(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const No_Paris_Card =
    (formatAmount(ParisAsset?.amount, ParisAsset?.decimals) ?? 0) == 0;

  const Paris_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('ArcdeTriomphe'); // Example condition: Return true if item is 'item2'
  });
  //
  //

  // WASHINGTON
  //
  const WashingtonAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === WASHINGTON_ASSET_INDEX(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const No_Washington_Card =
    (formatAmount(WashingtonAsset?.amount, WashingtonAsset?.decimals) ?? 0) ==
    0;

  const Washington_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('WhiteHouse'); // Example condition: Return true if item is 'item2'
  });

  // ROME
  //
  const RomeAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === ROME_ASSET_INDEX(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const No_Rome_Card =
    (formatAmount(RomeAsset?.amount, RomeAsset?.decimals) ?? 0) == 0;

  const Rome_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('Colosseum'); // Example condition: Return true if item is 'item2'
  });
  //
  //

  // NEW YORK
  //
  const NYCAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === NYC_ASSET_INDEX(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const No_NYC_Card =
    (formatAmount(NYCAsset?.amount, NYCAsset?.decimals) ?? 0) == 0;

  const NYC_1_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('EmpireStateBuilding1');
  });

  const NYC_2_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('EmpireStateBuilding2');
  });

  const NYC_3_built = tilesMap.some((item) => {
    // Replace this condition with your own logic
    return item.object.includes('EmpireStateBuilding3');
  });

  //

  const object_below =
    depositAsset.index + 5 < 36
      ? tilesMap[depositAsset.index + 5].object
      : 'OutOfMapRange';

  const object_above =
    depositAsset.index - 7 > 6
      ? tilesMap[depositAsset.index - 7].object
      : 'OutOfMapRange';

  /* map_enum is an array created from TextureType, with a filter to keep only text keys */
  const map_enum = Object.keys(TextureType).filter((v) => isNaN(Number(v)));
  /* we remove pending assets */
  const map_enum_filt = map_enum.filter((v) => !v.includes(`pending`));

  const map_enum_filt_special = map_enum_filt.filter((item) => {
    // Replace these conditions with your own logic
    if (
      (item === 'ArcdeTriomphe' && (No_Paris_Card || Paris_built)) ||
      (item === 'WhiteHouse' && (No_Washington_Card || Washington_built)) ||
      (item === 'Colosseum' && (No_Rome_Card || Rome_built)) ||
      (item === 'EmpireStateBuilding1' && (No_NYC_Card || NYC_1_built)) ||
      (item === 'EmpireStateBuilding2' &&
        (!object_below.includes('EmpireStateBuilding1') ||
          No_NYC_Card ||
          NYC_2_built)) ||
      (item === 'EmpireStateBuilding3' &&
        (!object_below.includes('EmpireStateBuilding2') ||
          No_NYC_Card ||
          NYC_3_built))
    ) {
      return false; // Exclude items that meet the conditions
    }
    return true; // Include items that do not meet the conditions
  });

  return (
    <div>
      <Dialog id={FROM_ASSET_PICKER_DIALOG_ID} open={open} scroll={`paper`}>
        <DialogTitle>What do you want to build?</DialogTitle>
        <DialogContent sx={{ maxWidth: `400px` }} dividers={true}>
          <ImageList
            sx={{
              width: 300,
            }}
            cols={3}
            rowHeight={100}
          >
            {map_enum_filt_special.map((key) => (
              // eslint-disable-next-line react/jsx-no-comment-textnodes
              <ImageListItem
                key={key}
                sx={{
                  ...(selectedobject === key && {
                    border: 2,
                    borderColor: `red`,
                  }),
                }}
                onClick={() => {
                  setSelectedobject(key);
                }}
              >
                <img
                  src={`${
                    `/` + key.toLowerCase() + `.png`
                  }?w=100&h=100&fit=crop&auto=format`}
                  srcSet={`${
                    `/` + key.toLowerCase() + `.png`
                  }?w=100&h=100&fit=crop&auto=format&dpr=2 2x`}
                  alt={key}
                  loading="lazy"
                />
                <ImageListItemBar
                  title={key.replace(`_`, ` `)}
                  sx={{
                    height: 30,
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>

          <DialogContentText
            fontSize={14}
            sx={{ pt: 2, color: `warning.main` }}
          >
            {object_above.includes('EmpireStateBuilding')
              ? `Sorry, you can't remove this part of the building. Start removing it starting from its top!`
              : `By pressing Deposit, you are going to update the object for tile ${depositAsset.index} by paying ${depositAsset.cost} AWT.
            Please note that it will take up to 2 hours until ARC69 tag of the tile is
            updated by the manager wallet after deposit is performed.`}
          </DialogContentText>
          {` `}
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {`Current state : ${depositAsset.object.replace(`_`, ` `)}`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {`Current builder : ${depositAsset.builder.substring(0, 7)}...`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {`Current owner of this tile : ${depositAsset.owner.substring(
              0,
              7,
            )}...`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {object_above.includes('EmpireStateBuilding')
              ? ''
              : `Amount you will pay: ${depositAsset.cost} AWT (available : ${
                  formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0
                } AWT).`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {object_above.includes('EmpireStateBuilding')
              ? ''
              : `Transaction fees: 0.01 Algo`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onDepositCancelled();
              setSelectedobject(`0`);
            }}
          >
            Cancel
          </Button>

          <Button
            disabled={
              !(
                !object_above.includes('EmpireStateBuilding') &&
                enough_awt &&
                selectedobject &&
                !depositAsset.object.includes(selectedobject)
              )
            }
            onClick={() => {
              if (awtAsset && selectedobject) {
                onDepositConfirmed(selectedobject);
                setSelectedobject(`0`);
              }
            }}
          >
            Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
