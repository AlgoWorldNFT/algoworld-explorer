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

import { CHAIN_TYPE, EMPTY_ASSET_IMAGE_URL } from '@/common/constants';
import { Asset } from '@/models/Asset';
import { ChainType } from '@/models/Chain';
import getAssetsForAccount from '@/utils/accounts/getAssetsForAccount';

import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import optAssets from '@/utils/assets/optAssets';
import WalletManager from '@/wallets/walletManager';
import { AlgoWorldCityAsset } from '@/models/AlgoWorldAsset';
import lookupInfluenceDepositTxns from '@/utils/transactions/lookupInfluenceDepositTxns';
import parseInfluenceDepositTxns from '@/utils/transactions/parseInfluenceDepositTxns';
import { InfluenceDepositNote } from '@/models/InfluenceDepositNote';
import lookupPackPurchaseTxns from '@/utils/transactions/lookupPackPurchaseTxns';
import parsePackPurchaseTxn from '@/utils/transactions/parsePackPurchaseTxn';
import { PackPurchaseNote } from '@/models/PackPurchaseNote';
import { IpfsGateway } from '@/models/Gateway';

interface WalletConnectState {
  chain: ChainType;
  accounts: string[];
  address: string;
  assets: Asset[];
  fetchingAccountAssets: boolean;
  fetchingInfluenceTxnNotes: boolean;
  influenceTxnNotes: InfluenceDepositNote[];
  fetchingPackPurchaseTxns: boolean;
  selectedDepositAsset: AlgoWorldCityAsset | undefined;
  gateway: IpfsGateway;
}

const initialState = {
  accounts: [],
  address: ``,
  assets: [
    {
      index: 0,
      amount: 0,
      creator: ``,
      frozen: false,
      decimals: 6,
      offeringAmount: 0,
      requestingAmount: 0,
      imageUrl: EMPTY_ASSET_IMAGE_URL(IpfsGateway.DWEB_LINK),
      name: `Algo`,
      unitName: `Algo`,
    },
  ],
  influenceTxnNotes: [],
  fetchingInfluenceTxnNotes: false,
  fetchingPackPurchaseTxns: false,
  selectedDepositAsset: undefined,
  chain: CHAIN_TYPE,
  gateway: IpfsGateway.DWEB_LINK,
  fetchingAccountAssets: false,
} as WalletConnectState;

export const getAccountAssets = createAsyncThunk(
  `walletConnect/getAccountAssets`,
  async ({
    chain,
    address,
    gateway,
  }: {
    chain: ChainType;
    address: string;
    gateway: IpfsGateway;
  }) => {
    return await getAssetsForAccount(chain, address, gateway);
  },
);

export const getInfluenceDepositTxns = createAsyncThunk(
  `walletConnect/getInfluenceDepositTxns`,
  async (
    { chain, managerAddress }: { chain: ChainType; managerAddress: string },
    { getState },
  ) => {
    let state = getState() as any;
    state = state.walletConnect as WalletConnectState;

    const rawTxns = await lookupInfluenceDepositTxns(
      chain,
      state.address,
      managerAddress,
    );

    const processedTxnNotes = await parseInfluenceDepositTxns(rawTxns, chain);

    return processedTxnNotes;
  },
);

export const performOptAssets = createAsyncThunk(
  `walletConnect/performOptAssets`,
  async (
    {
      assetIndexes,
      connector,
      deOptIn = false,
    }: { assetIndexes: number[]; connector: WalletManager; deOptIn?: boolean },
    { getState, dispatch },
  ) => {
    let state = getState() as any;
    state = state.walletConnect as WalletConnectState;

    return await optAssets(
      state.chain,
      state.gateway,
      assetIndexes,
      connector,
      state.address,
      dispatch,
      deOptIn,
    );
  },
);

export const walletConnectSlice = createSlice({
  name: `walletConnect`,
  initialState,
  reducers: {
    switchChain(state, action: PayloadAction<ChainType>) {
      if (action.payload && state.chain !== action.payload) {
        state.chain = action.payload;
        state.selectedDepositAsset = undefined;

        if (typeof window !== `undefined`) {
          localStorage.setItem(`ChainType`, action.payload);
        }
      }
    },
    setSelectedDepositAsset(
      state,
      action: PayloadAction<AlgoWorldCityAsset | undefined>,
    ) {
      state.selectedDepositAsset = action.payload;
    },
    setGateway: (state, action: PayloadAction<IpfsGateway>) => {
      state.gateway = action.payload;

      if (typeof window !== `undefined`) {
        localStorage.setItem(`IpfsGateway`, action.payload);
      }
    },
    reset: (state) => ({ ...initialState, chain: state.chain }),
    onSessionUpdate: (state, action: PayloadAction<string[]>) => {
      state.accounts = action.payload;
      state.address = action.payload[0];
    },
  },
  extraReducers(builder) {
    builder.addCase(getAccountAssets.fulfilled, (state, action) => {
      state.fetchingAccountAssets = false;
      state.assets = action.payload;
    });
    builder.addCase(getAccountAssets.pending, (state) => {
      state.fetchingAccountAssets = true;
    });

    builder.addCase(getInfluenceDepositTxns.fulfilled, (state, action) => {
      state.fetchingInfluenceTxnNotes = false;
      state.influenceTxnNotes = action.payload;
    });
    builder.addCase(getInfluenceDepositTxns.pending, (state) => {
      state.fetchingInfluenceTxnNotes = true;
    });
  },
});

export const selectAssets = createSelector(
  (state: RootState) => state.walletConnect.assets,
  (assets) => assets.map((a) => ({ ...a, amount: a.amount })),
);

export const {
  switchChain,
  reset,
  onSessionUpdate,
  setSelectedDepositAsset,
  setGateway,
} = walletConnectSlice.actions;

export default walletConnectSlice.reducer;
