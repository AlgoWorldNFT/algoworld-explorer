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
  Container,
  Grid,
  Grow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageHeader from '@/components/Headers/PageHeader';

import { useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import { CityPack, CityPackType } from '@/models/CityPack';
import { connector } from '@/redux/store/connector';
import PackCard from '@/components/Cards/PackCard';
import InfoDialog from '@/components/Dialogs/InfoDialog';
import shortenAddress from '@/utils/shortenAddress';
import { getAccountAssets } from '@/redux/slices/walletConnectSlice';
import router from 'next/router';
import ViewOnAlgoExplorerButton from '@/components/Buttons/ViewOnAlgoExplorerButton';
import useLoadingIndicator from '@/redux/hooks/useLoadingIndicator';
import { useSnackbar } from 'notistack';
import createPerformPackPurchaseTxns from '@/utils/transactions/createPerformPackPurchaseTxns';
import submitTransactions from '@/utils/transactions/submitTransactions';
import ConfirmPackPurchaseDialog from '@/components/Dialogs/ConfirmPackPurchaseDialog';
import PackPurchasesTable from '@/components/Tables/PackPurchasesTable';

const Packs = () => {
  const theme = useTheme();
  const packPurchaseFee = 0.017;
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));
  const { chain, gateway, address } = useAppSelector(
    (state) => state.walletConnect,
  );
  const [cityPackType, setCityPackType] = useState(CityPackType.Available);

  const [confirmSwapDialogOpen, setConfirmSwapDialogOpen] =
    useState<boolean>(false);
  const [shareSwapDialogOpen, setShareSwapDialogOpen] =
    useState<boolean>(false);

  const packsUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/cities/packs/${
      cityPackType === CityPackType.Available ? `available` : `purchased`
    }.json`;
  }, [chain, cityPackType]);

  const packsResponse = useSWR(packsUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const packs: CityPack[] = useMemo(() => {
    if (packsResponse.error || !packsResponse.data) {
      return [];
    }

    return [].concat(...Array.from({ length: 1 }, () => packsResponse.data));
  }, [packsResponse.data, packsResponse.error]);

  const { setLoading, resetLoading } = useLoadingIndicator();

  const dispatch = useAppDispatch();
  const [selectedPack, setSelectedPack] = useState<CityPack | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newCityPackType: CityPackType,
  ) => {
    if (newCityPackType) setCityPackType(newCityPackType);
  };

  const signAndSendPackPurchaseTxns = async (selectedPack: CityPack) => {
    const performSwapTxns = await createPerformPackPurchaseTxns(
      chain,
      address,
      selectedPack,
    );

    const signedPerformSwapTxns = await connector
      .signTransactions(performSwapTxns)
      .catch(() => {
        enqueueSnackbar(`You have cancelled transactions signing...`, {
          variant: `error`,
        });
        return undefined;
      });

    if (!signedPerformSwapTxns) {
      return undefined;
    }

    const performSwapResponse = await submitTransactions(
      chain,
      signedPerformSwapTxns,
    );

    return performSwapResponse.txId;
  };

  const handlePerformSwap = async () => {
    if (!selectedPack) {
      return;
    }

    setLoading(`Performing swap, please sign transactions...`);

    const txId = await signAndSendPackPurchaseTxns(selectedPack);

    if (!txId) {
      resetLoading();
      return;
    }

    enqueueSnackbar(`City Pack purchased successfully...`, {
      variant: `success`,
      action: () => <ViewOnAlgoExplorerButton chain={chain} txId={txId} />,
    });

    setShareSwapDialogOpen(true);
    resetLoading();
  };

  const handleOnPackPurchase = (pack: CityPack) => {
    setSelectedPack(pack);
    setConfirmSwapDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="🎲 City packs"
        description="Claim up to five random City cards"
      >
        <ToggleButtonGroup
          color="primary"
          value={cityPackType}
          sx={{
            pt: 2,
            justifyContent: `center`,
            width: `100%`,
          }}
          exclusive
          defaultChecked
          onChange={handleChange}
        >
          <ToggleButton value={CityPackType.Available}>Available</ToggleButton>
          <ToggleButton value={CityPackType.Purchased}>Purchased</ToggleButton>
        </ToggleButtonGroup>
      </PageHeader>
      <Container
        sx={{
          pb: 15,
          pl: largeScreen ? 15 : 0,
          pr: largeScreen ? 15 : 0,
          pt: 2,
        }}
        maxWidth="md"
        component="main"
      >
        {cityPackType === CityPackType.Available ? (
          packs.length > 0 ? (
            <Grid container spacing={3}>
              {packs.map((pack) => (
                <Grow key={pack.id} in {...{ timeout: 1000 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <PackCard
                      pack={pack}
                      purchaseClicked={handleOnPackPurchase}
                    />
                  </Grid>
                </Grow>
              ))}
            </Grid>
          ) : (
            <Grow in {...{ timeout: 1000 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ pt: 10 }}
                align="center"
                width={`100%`}
              >
                No packs available...
              </Typography>
            </Grow>
          )
        ) : (
          <PackPurchasesTable />
        )}
      </Container>
      {selectedPack && (
        <ConfirmPackPurchaseDialog
          title={`Purchase ${selectedPack.title}`}
          pack={selectedPack}
          open={confirmSwapDialogOpen}
          setOpen={setConfirmSwapDialogOpen}
          onConfirm={async () => {
            await handlePerformSwap();
          }}
          transactionsFee={packPurchaseFee}
        >
          {`Proceeding with purchase will perform transaction to send five random AlgoWorld City cards from packs's escrow to your wallet and will transfer requested asset to creator of the swap within a single atomic group. Thank you for supporting further development and improvements AlgoWorld ecosystem ❤️`}
        </ConfirmPackPurchaseDialog>
      )}

      {selectedPack && (
        <InfoDialog
          title="Successfully purchased City Pack"
          open={shareSwapDialogOpen}
          setOpen={setShareSwapDialogOpen}
          onClose={() => {
            dispatch(
              getAccountAssets({
                chain: chain,
                address: address,
                gateway,
              }) as any,
            );
            router.replace(`/packs`);
          }}
        >
          {`Swap ${shortenAddress(
            selectedPack.escrow,
          )} was performed, thank you for using AlgoWorld Explorer ❤️`}
        </InfoDialog>
      )}
    </>
  );
};

export default Packs;
