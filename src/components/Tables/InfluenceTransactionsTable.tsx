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
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, LinearProgress, Stack, Tooltip } from '@mui/material';
import {
  GithubInfluenceData,
  InfluenceDepositNoteData,
} from '@/models/InfluenceDepositNoteData';
import { useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import ViewOnAlgoExplorerButton from '../Buttons/ViewOnAlgoExplorerButton';
import { ChainType } from '@/models/Chain';
import shortenAddress from '@/utils/shortenAddress';

const getColumns = (chain: ChainType) => {
  return [
    {
      field: `acfgTxn`,
      flex: 1,
      headerName: `Transaction ID`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: GridRenderCellParams<string>) => {
        const value = params.value ?? `N/A`;
        return (
          <Tooltip
            enterTouchDelay={0}
            title={
              <span>
                {value.includes(`Pending`)
                  ? `Please await for the platform to process your deposit and issue a txn to update AlgoWorld City ARC Traits. Transactions are processed every hour.`
                  : value}
              </span>
            }
          >
            <div>
              {value.includes(`Pending`) ? value : shortenAddress(value)}
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: `assetIndex`,
      flex: 1,
      headerName: `Asset index`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
    },
    {
      field: `assetTitle`,
      flex: 1,
      headerName: `Asset Title`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: GridRenderCellParams<string>) => {
        const value = params.value ?? `N/A`;
        return (
          <Tooltip enterTouchDelay={0} title={<span>{value}</span>}>
            <div>{value}</div>
          </Tooltip>
        );
      },
    },
    {
      field: `deposit`,
      flex: 1,
      headerName: `Deposit (AWT)`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
    },
    {
      field: `block`,
      flex: 1,
      headerName: `Block`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
    },
    {
      field: `influence`,
      flex: 1,
      headerName: `Influence (AWT)`,
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
    },
    {
      field: `action`,
      flex: 1,
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      headerName: `AlgoExplorer`,
      sortable: false,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: { row: { acfgTxn: string } }) => {
        return (
          <ViewOnAlgoExplorerButton
            chain={chain}
            disabled={params.row.acfgTxn.includes(`Pending`)}
            txId={params.row.acfgTxn}
            customLabel={`View`}
          />
        );
      },
    },
  ] as GridColDef[];
};

const InfluenceTransactionsTable = () => {
  const chain = useAppSelector((state) => state.walletConnect.chain);
  const influenceTxnNotes = useAppSelector(
    (state) => state.walletConnect.influenceTxnNotes,
  );
  const processedInfluencesUrl = React.useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/cities/influence/processed_notes.json`;
  }, [chain]);

  const processedInfluencesResponse = useSWR(
    processedInfluencesUrl,
    (url: string) => {
      return fetch(url).then((res) => res.json());
    },
  );

  const processedInfluencesData: InfluenceDepositNoteData =
    React.useMemo(() => {
      if (
        processedInfluencesResponse.error ||
        !processedInfluencesResponse.data
      ) {
        return {};
      }

      return processedInfluencesResponse.data;
    }, [processedInfluencesResponse]);

  const processedInfluences: GithubInfluenceData[] = React.useMemo(() => {
    const response = Object.values(processedInfluencesData).map((item) => {
      const note = item as { [key: string]: any };
      return {
        acfgTxn: note[`acfg_txn`],
        assetIndex: note[`asset_id`],
        assetTitle: note[`asset_name`],
        block: note[`block`],
        deposit: note[`deposit`],
        noteId: note[`id`],
        influence: note[`influence`],
        senderAddress: note[`sender_address`],
      } as GithubInfluenceData;
    });

    return response;
  }, [processedInfluencesData]);

  const influenceDepositTransactions: GithubInfluenceData[] =
    React.useMemo(() => {
      const depositTransactions: GithubInfluenceData[] = [];

      influenceTxnNotes.forEach(async (note) => {
        if (note.noteId in processedInfluencesData) {
          const processedNote = processedInfluences.find(
            (element) => element.noteId === note.noteId,
          );
          if (processedNote) {
            depositTransactions.push({
              ...processedNote,
            });
          }
        } else {
          depositTransactions.push({
            acfgTxn: `Pending...`,
            assetIndex: note.assetIndex,
            assetTitle: note.assetTitle,
            block: `Pending...`,
            deposit: note.influenceDeposit,
            noteId: note.noteId,
            influence: `Pending...`,
            senderAddress: `Pending...`,
          });
        }
      });

      return depositTransactions;
    }, [influenceTxnNotes, processedInfluences, processedInfluencesData]);

  return (
    <Box
      sx={{
        '& .super-app-theme--header': {
          backgroundColor: `background.paper`,
          color: `secondary.main`,
        },
        '& .cellStyle': {
          backgroundColor: `background.paper`,
        },
      }}
    >
      <DataGrid
        rows={influenceDepositTransactions}
        columns={getColumns(chain)}
        hideFooter={influenceDepositTransactions.length === 0}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              😔 No transactions available
            </Stack>
          ),
          LoadingOverlay: LinearProgress,
        }}
        autoHeight
        loading={
          !processedInfluencesResponse.data &&
          !processedInfluencesResponse.error
        }
        getRowId={(row) => row[`noteId`]}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getCellClassName={() => {
          return `cellStyle`;
        }}
      />
    </Box>
  );
};

export default InfluenceTransactionsTable;
