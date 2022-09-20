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

import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { LoadingIndicator } from '@/models/LoadingIndicator';

const initialState = {
  isWalletPopupOpen: false,
  isDepositInfluencePopupOpen: false,
  isAboutPopupOpen: false,
  loadingIndicator: {
    isLoading: false,
    message: undefined,
  } as LoadingIndicator,
  theme: `dark`,
};

export const applicationSlice = createSlice({
  name: `application`,
  initialState,
  reducers: {
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
});

export const {
  setIsWalletPopupOpen,
  setIsDepositInfluencePopupOpen,
  setIsAboutPopupOpen,
  setLoadingIndicator,
  setTheme,
} = applicationSlice.actions;

export default applicationSlice.reducer;
