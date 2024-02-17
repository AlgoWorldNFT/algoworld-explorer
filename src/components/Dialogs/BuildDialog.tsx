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
import { ChainType } from '@/models/Chain';
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
  SPECIAL_TILES_MAINNET,
  SPECIAL_TILES_TESTNET,
} from '@/common/constants';
import { MapAsset } from '@/models/MapAsset';
import { TextureType } from '@/models/TextureType';

type Props = {
  onDepositConfirmed: (object: string, cost: number) => void;
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

  const [CurrentCost, setCurrentCost] = useState(depositAsset.cost);

  const awtAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === AWT_ASSET_ID(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const SPECIAL_TILES = useMemo(() => {
    return chain === ChainType.MainNet
      ? SPECIAL_TILES_MAINNET
      : SPECIAL_TILES_TESTNET;
  }, [chain]);

  // returns an array with asset amount for each city associated to a special tile
  const assets_held: number[] = useMemo(() => {
    const assets_held_temp: number[] = [];

    SPECIAL_TILES.forEach((special_tile) => {
      const filteredAssets = assets.filter(
        (asset) => asset.index === special_tile.city_asset,
      );
      const asset_info =
        filteredAssets.length === 1 ? filteredAssets[0] : undefined;
      assets_held_temp[SPECIAL_TILES.indexOf(special_tile)] =
        formatAmount(asset_info?.amount, asset_info?.decimals) ?? 0;
    });
    return assets_held_temp;
  }, [SPECIAL_TILES, assets]);

  // object below the selected tile
  const object_below =
    depositAsset.index + 5 < 36
      ? tilesMap[depositAsset.index + 5].object
      : `OutOfMapRange`;

  // object above the selected tile
  const object_above =
    depositAsset.index - 7 >= 0
      ? tilesMap[depositAsset.index - 7].object
      : `OutOfMapRange`;

  /* map_enum is an array created from TextureType, with a filter to keep only text keys */
  const map_enum = Object.keys(TextureType).filter((v) => isNaN(Number(v)));
  /* we remove pending assets */
  const map_enum_filt = map_enum.filter((v) => !v.includes(`pending`));

  // We want to filter the selection based on tiles already built
  // For the Empire State Building, we need some additional conditions
  const map_enum_filt_special = map_enum_filt.filter((item) => {
    if (
      // the tile is a special tile
      (SPECIAL_TILES.some((special_tile) => {
        return special_tile.object === item;
      }) &&
        // the tile is already built
        tilesMap.some((item_built) => {
          return item_built.object.includes(item);
        })) ||
      (item === `EmpireStateBuilding2` &&
        !object_below.includes(`EmpireStateBuilding1`)) ||
      (item === `EmpireStateBuilding3` &&
        !object_below.includes(`EmpireStateBuilding2`))
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
                  SPECIAL_TILES.some((special_tile) => {
                    return (
                      special_tile.object === key &&
                      assets_held[SPECIAL_TILES.indexOf(special_tile)] === 0
                    );
                  })
                    ? setCurrentCost(depositAsset.cost * 5)
                    : setCurrentCost(depositAsset.cost);
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
            {object_above.includes(`EmpireStateBuilding`)
              ? `Sorry, you can't remove this part of the building. Start removing it starting from its top!`
              : `By pressing Deposit, you are going to update the object for tile ${depositAsset.index} by paying ${CurrentCost} AWT.
            Please note that it will take up to 2 hours until ARC69 tag of the tile is
            updated by the manager wallet after deposit is performed.`}
          </DialogContentText>
          {` `}
          <DialogContentText
            fontSize={18}
            sx={{ pt: 2, color: `warning.main` }}
          >
            {CurrentCost > depositAsset.cost
              ? `Warning ! You don't have any city card corresponding to this special tile. You will pay 5 times the normal price to build it.`
              : ``}
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
            {object_above.includes(`EmpireStateBuilding`)
              ? ``
              : `Amount you will pay: ${CurrentCost} AWT (available : ${
                  formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0
                } AWT).`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            {object_above.includes(`EmpireStateBuilding`)
              ? ``
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
                !object_above.includes(`EmpireStateBuilding`) &&
                (formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0) >
                  CurrentCost &&
                selectedobject &&
                !depositAsset.object.includes(selectedobject)
              )
            }
            onClick={() => {
              if (awtAsset && selectedobject) {
                onDepositConfirmed(selectedobject, CurrentCost);
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
