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

import { ChainType } from '@/models/Chain';
import { TransactionToSignType } from '@/models/Transaction';
import algosdk from 'algosdk';
import createTransactionToSign from '@/utils/transactions/createTransactionToSign';
import getTransactionParams from '@/utils/transactions/getTransactionParams';
import submitTransactions from '@/utils/transactions/submitTransactions';

import { setLoadingIndicator } from '@/redux/slices/applicationSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { getAccountAssets } from '@/redux/slices/applicationSlice';
import { IpfsGateway } from '@/models/Gateway';
import processTransactions from '../transactions/processTransactions';

export default async function optAssets(
  chain: ChainType,
  gateway: IpfsGateway,
  assetIndexes: number[],
  signTransactions: (transactions: Array<Uint8Array>) => Promise<Uint8Array[]>,
  creatorAddress: string,
  dispatch: Dispatch,
  deOptIn = false,
) {
  const optInTxns = [];
  const suggestedParams = await getTransactionParams(chain);
  const optPrefix = deOptIn ? `out` : `in`;

  dispatch(
    setLoadingIndicator({
      isLoading: true,
      message: `Creating opt-${optPrefix} transactions...`,
    }),
  );

  for (const index of assetIndexes) {
    optInTxns.push(
      createTransactionToSign(
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: creatorAddress,
          to: creatorAddress,
          amount: 0,
          assetIndex: index,
          note: new Uint8Array(
            Buffer.from(
              ` I am an asset opt-${optPrefix} transaction for algoworld swapper escrow, thank you for using AlgoWorld Swapper 🙂`,
            ),
          ),
          closeRemainderTo: deOptIn ? creatorAddress : undefined,
          suggestedParams,
        }),
        undefined,
        TransactionToSignType.UserTransaction,
      ),
    );
  }

  dispatch(
    setLoadingIndicator({
      isLoading: true,
      message: `Signing transactions...`,
    }),
  );

  const signedSaveSwapConfigTxns = await processTransactions(
    optInTxns,
    signTransactions,
  ).catch(() => {
    dispatch(setLoadingIndicator({ isLoading: false, message: undefined }));
    return undefined;
  });

  if (!signedSaveSwapConfigTxns) {
    dispatch(setLoadingIndicator({ isLoading: false, message: undefined }));
    return undefined;
  }

  dispatch(
    setLoadingIndicator({
      isLoading: true,
      message: `Submitting opt-${optPrefix} transactions, please wait...`,
    }),
  );

  const saveSwapConfigResponse = await submitTransactions(
    chain,
    signedSaveSwapConfigTxns,
  );

  dispatch(setLoadingIndicator({ isLoading: false, message: undefined }));

  // Makes sure to reload assets after opt-in
  dispatch(
    getAccountAssets({ chain, gateway, address: creatorAddress }) as any,
  );

  return saveSwapConfigResponse.txId;
}
