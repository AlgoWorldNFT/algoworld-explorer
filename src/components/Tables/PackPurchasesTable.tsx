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
import { useAppSelector } from '@/redux/store/hooks';
import { useAsync } from 'react-use';
import getPackPurchaseTxns from '@/utils/transactions/getPackPurchaseTxns';
import parsePackPurchaseTxn from '@/utils/transactions/parsePackPurchaseTxn';
import ViewOnAlgoExplorerButton from '../Buttons/ViewOnAlgoExplorerButton';
import { ChainType } from '@/models/Chain';
import shortenAddress from '@/utils/shortenAddress';

const getColumns = (chain: ChainType) => {
  return [
    {
      field: `packId`,
      flex: 1,
      headerName: `Pack Title`,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: GridRenderCellParams<string>) => {
        const value = params.value ?? `N/A`;
        return <div>{`Pack #${value}`}</div>;
      },
    },
    {
      field: `txId`,
      flex: 1,
      headerName: `Transaction ID`,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: GridRenderCellParams<string>) => {
        const value = params.value ?? `N/A`;
        return (
          <Tooltip enterTouchDelay={0} title={<span>{value}</span>}>
            <div>{shortenAddress(value)}</div>
          </Tooltip>
        );
      },
    },
    {
      field: `buyerAddress`,
      flex: 1,
      headerName: `Buyer Address`,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: GridRenderCellParams<string>) => {
        const value = params.value ?? `N/A`;
        return (
          <Tooltip enterTouchDelay={0} title={<span>{value}</span>}>
            <div>{shortenAddress(value)}</div>
          </Tooltip>
        );
      },
    },
    {
      field: `action`,
      flex: 1,
      headerName: `AlgoExplorer`,
      sortable: false,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params) => {
        return (
          <ViewOnAlgoExplorerButton
            chain={chain}
            txId={params.row.txId}
            customLabel={`View`}
          />
        );
      },
    },
  ] as GridColDef[];
};

type Props = {
  address?: string;
};

const PackPurchasesTable = ({ address }: Props) => {
  const chain = useAppSelector((state) => state.walletConnect.chain);

  const loadPacksState = useAsync(async () => {
    const txns = await getPackPurchaseTxns(chain, address);
    return parsePackPurchaseTxn(txns);
  }, [chain]);

  return (
    <Box
      sx={{
        width: 1,
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
        rows={loadPacksState.value || []}
        columns={getColumns(chain)}
        hideFooter={(loadPacksState.value || []).length === 0}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              😔 No transactions available
            </Stack>
          ),
          LoadingOverlay: LinearProgress,
        }}
        pagination
        autoHeight
        getRowId={(row) => row[`packId`]}
        loading={loadPacksState.loading}
        rowsPerPageOptions={[10, 25, 50, 100]}
        getCellClassName={() => {
          return `cellStyle`;
        }}
      />
    </Box>
  );
};

export default PackPurchasesTable;
