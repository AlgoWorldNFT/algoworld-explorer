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
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { LoadingIndicator } from '@/models/LoadingIndicator';
import { EMPTY_ASSET_IMAGE_URL, CHAIN_TYPE } from '@/common/constants';
import { IpfsGateway } from '@/models/Gateway';
import { AlgoWorldCityAsset } from '@/models/AlgoWorldAsset';
import { ChainType } from '@/models/Chain';
import getAssetsForAccount from '@/utils/accounts/getAssetsForAccount';
import optAssets from '@/utils/assets/optAssets';
import lookupInfluenceDepositTxns from '@/utils/transactions/lookupInfluenceDepositTxns';
import parseInfluenceDepositTxns from '@/utils/transactions/parseInfluenceDepositTxns';

const initialState = {
  assets: [
    {
      index: 0,
      amount: 0,
      creator: ``,
      frozen: false,
      decimals: 6,
      offeringAmount: 0,
      requestingAmount: 0,
      imageUrl: EMPTY_ASSET_IMAGE_URL(IpfsGateway.ALGONODE_IO),
      name: `Algo`,
      unitName: `Algo`,
    },
  ],
  influenceTxnNotes: [],
  fetchingInfluenceTxnNotes: false,
  fetchingPackPurchaseTxns: false,
  selectedDepositAsset: undefined,
  chain: CHAIN_TYPE,
  gateway: IpfsGateway.ALGONODE_IO,
  fetchingAccountAssets: false,

  isWalletPopupOpen: false,
  isDepositInfluencePopupOpen: false,
  isAboutPopupOpen: false,
  loadingIndicator: {
    isLoading: false,
    message: undefined,
  } as LoadingIndicator,
  theme: `dark`,
};

export const getAccountAssets = createAsyncThunk(
  `application/getAccountAssets`,
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
  `application/getInfluenceDepositTxns`,
  async (
    {
      chain,
      address,
      managerAddress,
    }: { chain: ChainType; address: string; managerAddress: string },
    {},
  ) => {
    const rawTxns = await lookupInfluenceDepositTxns(
      chain,
      address,
      managerAddress,
    );

    const processedTxnNotes = await parseInfluenceDepositTxns(rawTxns, chain);

    return processedTxnNotes;
  },
);

export const performOptAssets = createAsyncThunk(
  `application/performOptAssets`,
  async (
    {
      assetIndexes,
      gateway,
      chain,
      activeAddress,
      signTransactions,
      deOptIn = false,
    }: {
      assetIndexes: number[];
      gateway: IpfsGateway;
      chain: ChainType;
      activeAddress: string;
      signTransactions: (
        transactions: Array<Uint8Array>,
      ) => Promise<Uint8Array[]>;
      deOptIn?: boolean;
    },
    { dispatch },
  ) => {
    return await optAssets(
      chain,
      gateway,
      assetIndexes,
      signTransactions,
      activeAddress,
      dispatch,
      deOptIn,
    );
  },
);

export const applicationSlice = createSlice({
  name: `application`,
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

    setIsWalletPopupOpen: (state, action: PayloadAction<boolean>) => {
      state.isWalletPopupOpen = action.payload;
    },
    setLoadingIndicator: (state, action: PayloadAction<LoadingIndicator>) => {
      state.loadingIndicator = action.payload;
    },
    setIsDepositInfluencePopupOpen: (state, action: PayloadAction<boolean>) => {
      state.isDepositInfluencePopupOpen = action.payload;
    },
    setIsAboutPopupOpen: (state, action: PayloadAction<boolean>) => {
      state.isAboutPopupOpen = action.payload;
    },
    setTheme: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState>,
    ) => {
      state.theme = action.payload.theme;
    },
  },
  extraReducers: (builder) => {
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

export const {
  switchChain,
  reset,
  setSelectedDepositAsset,
  setGateway,
  setIsWalletPopupOpen,
  setIsDepositInfluencePopupOpen,
  setIsAboutPopupOpen,
  setLoadingIndicator,
  setTheme,
} = applicationSlice.actions;

export default applicationSlice.reducer;
