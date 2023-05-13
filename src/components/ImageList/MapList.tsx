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

import { MapAsset } from '@/models/MapAsset';
import { useState, useMemo } from 'react';
import { BuildDialog } from '@/components/Dialogs/BuildDialog';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  setIsBuildPopupOpen,
  setIsWalletPopupOpen,
} from '@/redux/slices/applicationSlice';
import { setSelectedBuildTile } from '@/redux/slices/applicationSlice';
import {
  AWT_ASSET_ID,
  BUILD_MANAGER_ADDRESS,
  TXN_SUBMISSION_FAILED_MESSAGE,
} from '@/common/constants';
import submitTransactions from '@/utils/transactions/submitTransactions';
import { useSnackbar } from 'notistack';
import createBuildTxns from '@/utils/transactions/createBuildTxns';
import { TransactionToSign } from '@/models/Transaction';
import useLoadingIndicator from '@/redux/hooks/useLoadingIndicator';
import ViewOnAlgoExplorerButton from '@/components/Buttons/ViewOnAlgoExplorerButton';
import { useRouter } from 'next/router';
import { useWallet } from '@txnlab/use-wallet';
import processTransactions from '@/utils/transactions/processTransactions';
import {
  Box,
  Button,
  Switch,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

type Props = {
  tiles: MapAsset[];
};

// Fixed number of columns
const gridContainer = {
  display: `grid`,
  gridTemplateColumns: `repeat(6, 6fr)`,
  borderRadius: 5,
  overflow: `hidden`,
};

const MapList = ({ tiles }: Props) => {
  const { activeAddress: address, signTransactions } = useWallet();
  const { chain, selectedBuildTile } = useAppSelector(
    (state) => state.application,
  );
  const router = useRouter();

  const { setLoading, resetLoading } = useLoadingIndicator();

  const isBuildPopupOpen = useAppSelector(
    (state) => state.application.isBuildPopupOpen,
  );
  const dispatch = useAppDispatch();

  /* When called : open the popup to build on a tile */
  const handleSelectBuildTile = (asset: MapAsset) => {
    if (address) {
      dispatch(setIsBuildPopupOpen(true));
      dispatch(setSelectedBuildTile(asset));
    } else {
      /* If no wallet connected, open the popup to connect wallet */
      dispatch(setIsWalletPopupOpen(true));
    }
  };
  const awtIndex = useMemo(() => {
    return AWT_ASSET_ID(chain);
  }, [chain]);
  const { enqueueSnackbar } = useSnackbar();

  const signAndSendBuildTxns = async (txns: TransactionToSign[]) => {
    const signedBuildTxns = await processTransactions(
      txns,
      signTransactions,
    ).catch(() => {
      enqueueSnackbar(`You have cancelled transactions signing...`, {
        variant: `error`,
      });
      return undefined;
    });

    if (!signedBuildTxns) {
      return undefined;
    }

    const BuildResponse = await submitTransactions(chain, signedBuildTxns);

    return BuildResponse.txId;
  };

  const handleBuildTile = async (
    depositAmount: number,
    objectType: string,
    assetIndex: number,
    owner: string,
    awtIndex: number,
  ) => {
    setLoading(
      `Setting up deposit, please sign transaction to deposit AWT and build on tile ${assetIndex}...`,
    );

    const txns = await createBuildTxns(
      chain,
      address as string,
      BUILD_MANAGER_ADDRESS,
      1000,
      depositAmount,
      objectType,
      assetIndex,
      owner,
      awtIndex,
    );

    const txId = await signAndSendBuildTxns(txns);

    if (!txId) {
      resetLoading();
      enqueueSnackbar(TXN_SUBMISSION_FAILED_MESSAGE, {
        variant: `error`,
      });
      return;
    }

    enqueueSnackbar(
      `Deposit of AWT to build on the tile ${assetIndex} was performed.`,
      {
        variant: `success`,
        action: () => (
          <>
            <Button
              onClick={() => {
                router.push(`/my-transactions`);
              }}
            >
              View My Transactions
            </Button>
            <ViewOnAlgoExplorerButton chain={chain} txId={txId} />
          </>
        ),
      },
    );

    resetLoading();
  };

  const [isChecked_owner, setIsChecked_owner] = useState(false);
  const [isChecked_builder, setIsChecked_builder] = useState(false);

  return (
    <div>
      {address ? (
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Your tiles</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isChecked_owner}
                  onChange={() => setIsChecked_owner(!isChecked_owner)}
                  name="owner"
                />
              }
              label="Tiles that you own"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isChecked_builder}
                  onChange={() => setIsChecked_builder(!isChecked_builder)}
                  name="builder"
                />
              }
              label="Tiles that you built"
            />
          </FormGroup>
          <FormHelperText>Highlight tiles that you own or built</FormHelperText>
        </FormControl>
      ) : (
        <Box
          sx={{
            display: `flex`,
            justifyContent: `center`,
            marginBottom: 2, // Adjust this value for spacing below the button
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              dispatch(setIsWalletPopupOpen(true));
            }}
          >
            Connect your wallet and start building!
          </Button>
        </Box>
      )}

      <Box sx={gridContainer}>
        {tiles.map((item) => (
          <Box
            key={item.index}
            component="img"
            sx={{
              height: 1,
              width: 1,
              ...(((isChecked_owner && item.owner === address) ||
                (isChecked_builder && item.builder === address)) && {
                border: 5,
                borderColor: `red`,
              }),
            }}
            alt="tile image"
            src={`/` + String(item.object).toLowerCase() + `.png`}
            onClick={() => {
              /*open the popup window and indicate the tile to build */
              handleSelectBuildTile(item);
            }}
          ></Box>
        ))}

        {selectedBuildTile && isBuildPopupOpen && (
          <BuildDialog
            onDepositConfirmed={function (objectType: string): void {
              dispatch(setIsBuildPopupOpen(false));
              handleBuildTile(
                selectedBuildTile.cost,
                objectType,
                selectedBuildTile.index,
                selectedBuildTile.owner,
                awtIndex,
              );
            }}
            onDepositCancelled={function (): void {
              dispatch(setIsBuildPopupOpen(false));
              dispatch(setSelectedBuildTile(undefined));
            }}
            depositAsset={selectedBuildTile}
            open={isBuildPopupOpen}
          />
        )}
      </Box>
    </div>
  );
};

export default MapList;
