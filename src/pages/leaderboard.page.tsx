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

import {
  Button,
  Container,
  Grow,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageHeader from '@/components/Headers/PageHeader';

import { useMemo } from 'react';
import { AlgoWorldCityAsset } from '@/models/AlgoWorldAsset';
import useSWR from 'swr';
import Image from 'next/image';
import LeaderboardTable from '@/components/Tables/LeaderboardTable';
import { DepositInfluenceDialog } from '@/components/Dialogs/DepositInfluenceDialog';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  setIsDepositInfluencePopupOpen,
  setIsWalletPopupOpen,
} from '@/redux/slices/applicationSlice';
import { setSelectedDepositAsset } from '@/redux/slices/applicationSlice';
import {
  AWT_ASSET_ID,
  CITY_MANAGER_ADDRESS,
  EMPTY_ASSET_IMAGE_URL,
  SITE_IS_UNDER_MAINTENANCE,
  TXN_SUBMISSION_FAILED_MESSAGE,
} from '@/common/constants';
import submitTransactions from '@/utils/transactions/submitTransactions';
import { useSnackbar } from 'notistack';
import createInfluenceDepositTxns from '@/utils/transactions/createInfluenceDepositTxns';
import { TransactionToSign } from '@/models/Transaction';
import useLoadingIndicator from '@/redux/hooks/useLoadingIndicator';
import ViewOnAlgoExplorerButton from '@/components/Buttons/ViewOnAlgoExplorerButton';
import { toIpfsProxyUrl } from '@/utils/toIpfsProxyUrl';
import { useRouter } from 'next/router';
import MaintenanceLayout from '@/components/Layouts/MaintenanceLayout';
import { useWallet } from '@txnlab/use-wallet';
import processTransactions from '@/utils/transactions/processTransactions';

const Leaderboard = () => {
  const { activeAddress: address, signTransactions } = useWallet();
  const { chain, gateway, selectedDepositAsset } = useAppSelector(
    (state) => state.application,
  );
  const router = useRouter();
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));
  const screenOffset = largeScreen ? 5 : 0;

  const citiesUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/cities/database.json`;
  }, [chain]);

  const citiesResponse = useSWR(citiesUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const { setLoading, resetLoading } = useLoadingIndicator();

  const cities: AlgoWorldCityAsset[] = useMemo(() => {
    if (citiesResponse.error || !citiesResponse.data) {
      return [];
    }
    return [...citiesResponse.data].sort(
      (a: AlgoWorldCityAsset, b: AlgoWorldCityAsset) =>
        b.influence - a.influence,
    );
  }, [citiesResponse.data, citiesResponse.error]);

  const isDepositInfluencePopupOpen = useAppSelector(
    (state) => state.application.isDepositInfluencePopupOpen,
  );
  const dispatch = useAppDispatch();
  const handleSelectDepositAsset = (asset: AlgoWorldCityAsset) => {
    if (address) {
      dispatch(setIsDepositInfluencePopupOpen(true));
      dispatch(setSelectedDepositAsset(asset));
    } else {
      dispatch(setIsWalletPopupOpen(true));
    }
  };
  const awtIndex = useMemo(() => {
    return AWT_ASSET_ID(chain);
  }, [chain]);
  const { enqueueSnackbar } = useSnackbar();

  const signAndSendInfluenceDepositTxns = async (txns: TransactionToSign[]) => {
    const signedInfluenceDepositTxns = await processTransactions(
      txns,
      signTransactions,
    ).catch(() => {
      enqueueSnackbar(`You have cancelled transactions signing...`, {
        variant: `error`,
      });
      return undefined;
    });

    if (!signedInfluenceDepositTxns) {
      return undefined;
    }

    const influenceDepositResponse = await submitTransactions(
      chain,
      signedInfluenceDepositTxns,
    );

    return influenceDepositResponse.txId;
  };

  const handleDepositInfluence = async (
    depositAmount: number,
    assetIndex: number,
    awtIndex: number,
  ) => {
    setLoading(
      `Setting up deposit, please sign transaction to deposit AWT and increase influence of asset ${assetIndex}...`,
    );

    const txns = await createInfluenceDepositTxns(
      chain,
      address as string,
      CITY_MANAGER_ADDRESS,
      1000,
      depositAmount,
      assetIndex,
      awtIndex,
    );

    const txId = await signAndSendInfluenceDepositTxns(txns);

    if (!txId) {
      resetLoading();
      enqueueSnackbar(TXN_SUBMISSION_FAILED_MESSAGE, {
        variant: `error`,
      });
      return;
    }

    enqueueSnackbar(
      `Deposit of AWT for asset ${assetIndex} was performed. Please refer to My Transactions page to see your pending transactions. Manager wallet will update the ARC 69 tags within 60 minutes to reflect your deposit, please wait...`,
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

  return SITE_IS_UNDER_MAINTENANCE ? (
    <MaintenanceLayout />
  ) : (
    <div>
      <PageHeader
        title="📃 City Rank Leaderboard"
        description="Discover top AlgoWorld cities by influence (updated every hour)"
      />

      <Container
        component="main"
        sx={{ pb: 15, pr: screenOffset, pl: screenOffset }}
      >
        {cities.length > 3 && (
          <Grow in {...{ timeout: 1000 }}>
            <Stack direction={`row`} justifyContent={`space-evenly`}>
              {cities.slice(0, 3).map((city) => {
                return (
                  <Image
                    key={city.index}
                    src={toIpfsProxyUrl(city.url, gateway)}
                    loading="lazy"
                    blurDataURL={EMPTY_ASSET_IMAGE_URL(gateway)}
                    placeholder="blur"
                    width={largeScreen ? 250 : 110}
                    height={largeScreen ? 500 : 130}
                    style={{
                      height: `auto`,
                    }}
                    alt={`AlgoWorld Card`}
                  />
                );
              })}
            </Stack>
          </Grow>
        )}

        <Container
          component="form"
          sx={{
            pt: 3,
            width: `100%`,
            pr: screenOffset,
            pl: screenOffset,
            display: `flex`,
            alignItems: `center`,
          }}
        >
          <LeaderboardTable
            cities={cities}
            onSelectDepositAsset={handleSelectDepositAsset}
          />
        </Container>
      </Container>

      {selectedDepositAsset && isDepositInfluencePopupOpen && (
        <DepositInfluenceDialog
          onDepositConfirmed={function (depositAmount: number): void {
            dispatch(setIsDepositInfluencePopupOpen(false));
            handleDepositInfluence(
              depositAmount,
              selectedDepositAsset.index,
              awtIndex,
            );
          }}
          onDepositCancelled={function (): void {
            dispatch(setIsDepositInfluencePopupOpen(false));
            dispatch(setSelectedDepositAsset(undefined));
          }}
          depositAsset={selectedDepositAsset}
          open={isDepositInfluencePopupOpen}
        />
      )}
    </div>
  );
};

export default Leaderboard;
