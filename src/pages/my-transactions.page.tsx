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

import PageHeader from '@/components/Headers/PageHeader';
import { setIsWalletPopupOpen } from '@/redux/slices/applicationSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { MY_SWAPS_PAGE_HEADER_ID } from '@/common/constants';
import { useState } from 'react';
import AlgoWorldTransactionType from '@/models/AlgoWorldTransactionType';
import InfluenceTransactionsTable from '@/components/Tables/InfluenceTransactionsTable';
// import useLoadingIndicator from '@/redux/hooks/useLoadingIndicator';
import PackPurchasesTable from '@/components/Tables/PackPurchasesTable';

export default function MyTransactions() {
  const dispatch = useAppDispatch();

  const address = useAppSelector((state) => state.walletConnect.address);

  const [transactionType, setTransactionType] = useState(
    AlgoWorldTransactionType.InfluenceDeposit,
  );

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newTransactionType: AlgoWorldTransactionType,
  ) => {
    setTransactionType(newTransactionType);
  };

  return (
    <>
      <PageHeader
        id={MY_SWAPS_PAGE_HEADER_ID}
        title="📜 My Transactions"
        description="Monitor and manage your transactions performed on AlgoWorldExplorer"
      >
        <ToggleButtonGroup
          color="primary"
          value={transactionType}
          sx={{
            pt: 2,
            justifyContent: `center`,
            width: `100%`,
          }}
          exclusive
          onChange={handleChange}
        >
          <ToggleButton value={AlgoWorldTransactionType.InfluenceDeposit}>
            Influence deposits
          </ToggleButton>
          <ToggleButton value={AlgoWorldTransactionType.PackPurchase}>
            Pack purchases
          </ToggleButton>
        </ToggleButtonGroup>
      </PageHeader>

      <Container
        maxWidth="md"
        sx={{ textAlign: `center`, pb: 15 }}
        component="main"
      >
        {!address ? (
          <Button
            onClick={() => {
              dispatch(setIsWalletPopupOpen(true));
            }}
            fullWidth
            variant="contained"
            color="primary"
          >
            Connect Wallet
          </Button>
        ) : transactionType === AlgoWorldTransactionType.InfluenceDeposit ? (
          <InfluenceTransactionsTable />
        ) : (
          <PackPurchasesTable address={address} />
        )}
      </Container>
    </>
  );
}
