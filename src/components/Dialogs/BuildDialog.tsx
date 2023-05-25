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
import { AWT_ASSET_ID } from '@/common/constants';
import { MapAsset } from '@/models/MapAsset';
import { TextureType } from '@/models/TextureType';

type Props = {
  onDepositConfirmed: (object: string) => void;
  onDepositCancelled: () => void;
  depositAsset: MapAsset;
  open: boolean;
};

export const BuildDialog = ({
  onDepositConfirmed,
  onDepositCancelled,
  depositAsset,
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

  /* map_enum is an array created from TextureType, with a filter to keep only text keys */
  const map_enum = Object.keys(TextureType).filter((v) => isNaN(Number(v)));
  /* we remove pending assets */
  const map_enum_filt = map_enum.filter((v) => !v.includes(`pending`));

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
            {map_enum_filt.map((key) => (
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
            {`By pressing Deposit, you are going to update the object for tile ${depositAsset.index} by paying ${depositAsset.cost} AWT.
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
            {`Amount you will pay: ${depositAsset.cost} AWT (available : ${
              formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0
            } AWT).`}
          </Typography>
          <Typography
            fontSize={14}
            sx={{ pt: 2, fontWeight: `bold`, color: `warning.main` }}
          >
            Transaction fees: 0.01 Algo
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
