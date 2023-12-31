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
import { GithubBuildData, BuildNoteData } from '@/models/BuildNoteData';
import { useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import ViewOnAlloExplorerButton from '../Buttons/ViewOnAlloExplorerButton';
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
                  ? `Please await for the platform to process your deposit and issue a txn to update the tile properties. Transactions are processed every hour.`
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
      headerName: `Tile index`,
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
      field: `object`,
      flex: 1,
      headerName: `Object index`,
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
      headerName: `Allo Explorer`,
      sortable: false,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: { row: { acfgTxn: string } }) => {
        return (
          <ViewOnAlloExplorerButton
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

const BuildTransactionsTable = () => {
  const chain = useAppSelector((state) => state.application.chain);
  const buildTxnNotes = useAppSelector(
    (state) => state.application.buildTxnNotes,
  );
  const processedBuildUrl = React.useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/aw_build/processed_notes.json`;
  }, [chain]);

  const processedBuildResponse = useSWR(processedBuildUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const processedBuildData: BuildNoteData = React.useMemo(() => {
    if (processedBuildResponse.error || !processedBuildResponse.data) {
      return {};
    }

    return processedBuildResponse.data;
  }, [processedBuildResponse]);

  const processedBuild: GithubBuildData[] = React.useMemo(() => {
    const response = Object.values(processedBuildData).map((item) => {
      const note = item as { [key: string]: any };
      return {
        acfgTxn: note[`acfg_txn`],
        assetIndex: note[`asset_id`],
        block: note[`block`],
        deposit: note[`deposit`],
        noteId: note[`id`],
        object: note[`object_id`],
        senderAddress: note[`sender_address`],
      } as GithubBuildData;
    });

    return response;
  }, [processedBuildData]);

  const BuildTransactions: GithubBuildData[] = React.useMemo(() => {
    const depositTransactions: GithubBuildData[] = [];

    buildTxnNotes.forEach(async (note) => {
      if (note.noteId in processedBuildData) {
        const processedNote = processedBuild.find(
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
          block: `Pending...`,
          deposit: note.deposit,
          noteId: note.noteId,
          object: note.object,
          senderAddress: `Pending...`,
        });
      }
    });

    return depositTransactions;
  }, [buildTxnNotes, processedBuild, processedBuildData]);

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
        rows={BuildTransactions}
        columns={getColumns(chain)}
        hideFooter={BuildTransactions.length === 0}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              😔 No transactions available
            </Stack>
          ),
          LoadingOverlay: LinearProgress,
        }}
        autoHeight
        loading={!processedBuildResponse.data && !processedBuildResponse.error}
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

export default BuildTransactionsTable;
