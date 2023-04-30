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
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { AWT_ASSET_ID } from '@/common/constants';
import { MapAsset } from '@/models/MapAsset';
import { TextureType } from '@/models/TextureType';

type Props = {
  onDepositConfirmed: (object: number) => void;
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

  const [selectedobject, setSelectedobject] = useState(`1`);

  const awtAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === AWT_ASSET_ID(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  const enough_awt =
    (formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 0) >
    depositAsset.cost;

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedobject(event.target.value);
  };

  return (
    <div>
      <Dialog id={FROM_ASSET_PICKER_DIALOG_ID} open={open}>
        <DialogTitle>What do you want to build?</DialogTitle>
        <DialogContent sx={{ maxWidth: `400px` }}>
          <Select
            labelId="build-select-label"
            id="build-select"
            value={selectedobject}
            label="What do you want to build?"
            onChange={handleChange}
          >
            <MenuItem value={1}>Meadow</MenuItem>
            <MenuItem value={2}>Forest</MenuItem>
            <MenuItem value={3}>Water</MenuItem>
            <MenuItem value={4}>House</MenuItem>
            <MenuItem value={5}>Castle</MenuItem>
          </Select>

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
            {`Current state : ${TextureType[depositAsset.object].replace(
              `_pending`,
              ` (pending)`,
            )}`}
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
                Number(selectedobject) &&
                Number(selectedobject) != depositAsset.object &&
                Number(selectedobject) !=
                  (depositAsset.object - (depositAsset.object % 10)) / 10
              )
            }
            onClick={() => {
              if (awtAsset && selectedobject) {
                onDepositConfirmed(Number(selectedobject));
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
