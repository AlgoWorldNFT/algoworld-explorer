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
import CryptoTextField from '../TextFields/CryptoTextField';
import formatAmount from '@/utils/formatAmount';
import { CoinType } from '@/models/CoinType';
import { FROM_ASSET_PICKER_DIALOG_ID } from './constants';
import { useAppSelector } from '@/redux/store/hooks';
import { DialogContentText, Typography } from '@mui/material';
import { AWT_ASSET_ID } from '@/common/constants';
import { AlgoWorldCityAsset } from '@/models/AlgoWorldAsset';

type Props = {
  onDepositConfirmed: (depositAmount: number) => void;
  onDepositCancelled: () => void;
  depositAsset: AlgoWorldCityAsset;
  open: boolean;
};

export const DepositInfluenceDialog = ({
  onDepositConfirmed,
  onDepositCancelled,
  depositAsset,
  open,
}: Props) => {
  const assets = useAppSelector((state) => state.walletConnect.assets);
  const chain = useAppSelector((state) => state.walletConnect.chain);

  const [selectedDepositAmount, setSelectedDepositAmount] = useState<
    number | undefined
  >(undefined);

  const awtAsset = useMemo(() => {
    const filteredAssets = assets.filter(
      (asset) => asset.index === AWT_ASSET_ID(chain),
    );
    return filteredAssets.length === 1 ? filteredAssets[0] : undefined;
  }, [assets, chain]);

  return (
    <div>
      <Dialog id={FROM_ASSET_PICKER_DIALOG_ID} open={open}>
        <DialogTitle>Deposit AWT Influence</DialogTitle>
        <DialogContent sx={{ maxWidth: `400px` }}>
          <CryptoTextField
            label={
              awtAsset && awtAsset.amount >= 0
                ? `Deposit amount (${formatAmount(
                    awtAsset.amount,
                    awtAsset.decimals,
                  )} available)`
                : `No AWT available...`
            }
            sx={{ mt: 2 }}
            disabled={!awtAsset || awtAsset.amount <= 0}
            value={selectedDepositAmount}
            onChange={(value) => {
              setSelectedDepositAmount(value);
            }}
            coinType={CoinType.ASA}
            decimals={awtAsset?.decimals ?? 0}
            maxValue={formatAmount(awtAsset?.amount, awtAsset?.decimals) ?? 1}
          />
          <DialogContentText
            fontSize={14}
            sx={{ pt: 2, color: `warning.main` }}
          >
            {`By pressing Deposit, you are going to deposit city influence in AWT
            tokens for ${depositAsset.name} (${depositAsset.index}).
            Please note that it will take up to 30 minutes until ARC69 tag is
            updated by the manager wallet after deposit is performed.`}
          </DialogContentText>
          {` `}
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
              setSelectedDepositAmount(undefined);
            }}
          >
            Cancel
          </Button>

          <Button
            disabled={!selectedDepositAmount}
            onClick={() => {
              if (awtAsset && selectedDepositAmount) {
                onDepositConfirmed(selectedDepositAmount);
                setSelectedDepositAmount(undefined);
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
