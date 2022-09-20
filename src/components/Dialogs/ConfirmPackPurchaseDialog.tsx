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

import { CityPack } from '@/models/CityPack';
import accountExists from '@/utils/accounts/accountExists';
import getAssetsForAccount from '@/utils/accounts/getAssetsForAccount';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useMemo } from 'react';
import { useAsync } from 'react-use';
import {
  CONFIRM_DIALOG_ID,
  DIALOG_CANCEL_BTN_ID,
  DIALOG_SELECT_BTN_ID,
} from './constants';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { Asset } from '@/models/Asset';
import { PERFORM_SWAP_OPTIN_BUTTON_ID } from '@/common/constants';
import { connector } from '@/redux/store/connector';
import getPackAssetsToOptIn from '@/utils/assets/getPackAssetsToOptIn';
import { LoadingButton } from '@mui/lab';
import { performOptAssets } from '@/redux/slices/walletConnectSlice';

type Props = {
  title: string;
  pack: CityPack | undefined;
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  transactionsFee?: number | string;
};

const ConfirmPackPurchaseDialog = ({
  title,
  pack,
  children,
  open,
  setOpen,
  onConfirm,
  transactionsFee,
}: Props) => {
  const {
    chain,
    address,
    assets: existingAssets,
    gateway,
  } = useAppSelector((state) => state.walletConnect);

  const dispatch = useAppDispatch();

  const assetsToOptIn = useMemo(() => {
    if (!pack) {
      return [];
    }
    return getPackAssetsToOptIn(pack.offered_asas, existingAssets);
  }, [existingAssets, pack]);

  const hasNoBalanceForAssets = useMemo(() => {
    if (!pack) {
      return true;
    }
    return existingAssets[0].amount < pack.requested_algo_amount;
  }, [existingAssets, pack]);

  const swapAssetsState = useAsync(async () => {
    if (!pack) {
      return undefined;
    }

    return await getAssetsForAccount(chain, pack.escrow, gateway);
  }, [pack, chain]);

  const swapAssets = useMemo(() => {
    if (swapAssetsState.loading || swapAssetsState.error) {
      return [];
    }

    return (swapAssetsState.value ?? []) as Asset[];
  }, [swapAssetsState.error, swapAssetsState.loading, swapAssetsState.value]);

  const hasZeroBalanceAssets = useMemo(() => {
    const zeroBalanceAssets = swapAssets.filter((asset) => {
      return asset.amount === 0;
    });

    return zeroBalanceAssets.length > 0;
  }, [swapAssets]);

  const swapIsActiveState = useAsync(async () => {
    return pack ? await accountExists(chain, pack.escrow) : false;
  }, [pack, chain]);

  const swapIsActive = useMemo(() => {
    if (swapIsActiveState.loading || swapIsActiveState.error) {
      return false;
    }

    return swapIsActiveState.value ?? false;
  }, [
    swapIsActiveState.loading,
    swapIsActiveState.error,
    swapIsActiveState.value,
  ]);

  return (
    <Dialog
      id={CONFIRM_DIALOG_ID}
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        {children}

        <Divider sx={{ pt: 1 }}></Divider>

        {transactionsFee && !hasZeroBalanceAssets && swapIsActive && (
          <Typography sx={{ pt: 1, fontWeight: `bold` }}>
            Transaction fees: ~{transactionsFee} Algo
          </Typography>
        )}

        {pack && pack.creator === address && (
          <Typography variant="h6" color={`warning.main`}>
            You can not perform the purchase since you are the creator...
          </Typography>
        )}
        {swapIsActiveState.loading && <LinearProgress color="secondary" />}
        {(hasZeroBalanceAssets ||
          (!swapIsActiveState.loading && !swapIsActive)) && (
          <Typography variant="h6" color={`warning.main`}>
            Sorry this pack was recently purchased. The pack will be moved to
            purchased tab within next 60 minutes.
          </Typography>
        )}
        {hasNoBalanceForAssets && (
          <Typography variant="h6" color={`warning.main`}>
            Insufficient funds...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button id={DIALOG_CANCEL_BTN_ID} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {assetsToOptIn.length > 0 && (
          <LoadingButton
            color="primary"
            id={PERFORM_SWAP_OPTIN_BUTTON_ID}
            onClick={() => {
              dispatch(
                performOptAssets({
                  assetIndexes: assetsToOptIn,
                  connector,
                }),
              );
            }}
          >
            Opt-In
          </LoadingButton>
        )}
        <Button
          disabled={
            assetsToOptIn.length === 0 ||
            hasZeroBalanceAssets ||
            !swapIsActive ||
            hasNoBalanceForAssets
          }
          id={DIALOG_SELECT_BTN_ID}
          color="secondary"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmPackPurchaseDialog;
