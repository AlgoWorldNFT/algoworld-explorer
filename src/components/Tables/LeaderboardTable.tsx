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
import {
  Button,
  LinearProgress,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AlgoWorldCityAsset } from '@/models/AlgoWorldAsset';

const createColumns = (
  onSelectDepositAsset: (asset: AlgoWorldCityAsset) => void,
) => {
  return [
    {
      field: `index`,
      flex: 1,
      headerName: `Index`,
      minWidth: 50,
      maxWidth: 500,
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
      field: `name`,
      flex: 1,
      headerName: `Name`,
      minWidth: 50,
      maxWidth: 500,
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
      field: `influence`,
      flex: 1,
      headerName: `Influence (AWT)`,
      minWidth: 50,
      maxWidth: 500,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
    },
    {
      field: `status`,
      flex: 1,
      headerName: `Status`,
      width: 100,
      minWidth: 50,
      maxWidth: 500,
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
      headerName: `Action`,
      sortable: false,
      headerAlign: `center`,
      headerClassName: `super-app-theme--header`,
      align: `center`,
      renderCell: (params: { row: AlgoWorldCityAsset }) => {
        return (
          <Button
            onClick={() => {
              onSelectDepositAsset(params.row);
            }}
          >
            Deposit
          </Button>
        );
      },
    },
  ] as GridColDef[];
};

type Props = {
  cities: AlgoWorldCityAsset[];
  onSelectDepositAsset: (asset: AlgoWorldCityAsset) => void;
  width?: number | string;
  customNoRowsOverlay?: React.JSXElementConstructor<any>;
};

const LeaderboardTable = ({
  cities,
  onSelectDepositAsset,
  width = 400,
  customNoRowsOverlay,
}: Props) => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));
  const columns = createColumns(onSelectDepositAsset);

  return (
    <DataGrid
      sx={{
        width: { width },
        '& .super-app-theme--header': {
          backgroundColor: `background.paper`,
          color: `secondary.main`,
        },
        '& .cellStyle': {
          backgroundColor: `background.paper`,
        },
        height: customNoRowsOverlay && largeScreen ? `400px` : `auto`,
      }}
      components={{
        NoRowsOverlay: customNoRowsOverlay
          ? customNoRowsOverlay
          : () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                😔 No cities available to deposit to
              </Stack>
            ),
        LoadingOverlay: LinearProgress,
      }}
      rows={cities}
      autoHeight={customNoRowsOverlay && largeScreen ? false : true}
      pageSize={10}
      pagination
      columns={columns}
      getRowId={(row) => {
        return `${row.index}${row.offeringAmount}${row.requestingAmount}`;
      }}
      autoPageSize
      getCellClassName={() => {
        return `cellStyle`;
      }}
    />
  );
};

export default LeaderboardTable;
