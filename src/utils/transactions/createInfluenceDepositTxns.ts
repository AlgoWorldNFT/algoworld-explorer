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

import { CITY_MANAGER_ADDRESS } from '@/common/constants';
import { ChainType } from '@/models/Chain';
import { TransactionToSignType } from '@/models/Transaction';
import algosdk from 'algosdk';
import createInfluenceDepositNote from './createInfluenceDepositNote';
import createTransactionToSign from './createTransactionToSign';
import getTransactionParams from './getTransactionParams';
import { v4 as uuidv4 } from 'uuid';

export default async function createInfluenceDepositTxns(
  chain: ChainType,
  sender: string,
  receiver: string,
  fundingFee: number,
  depositAmount: number,
  depositAssetIndex: number,
  influenceAssetIndex: number,
) {
  const suggestedParams = await getTransactionParams(chain);

  const txns = [];

  const feeTxn = createTransactionToSign(
    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: receiver,
      amount: fundingFee,
      note: new Uint8Array(
        Buffer.from(
          `I am a fee transaction for covering a fee that will be spend by manager wallet to update ARC69 tag within next 30 minutes :-)`,
        ),
      ),
      suggestedParams,
    }),
    undefined, // TODO: refactor
    TransactionToSignType.UserFeeTransaction,
  );

  txns.push(feeTxn);

  const noteId = uuidv4();
  const influenceDepositNote = createInfluenceDepositNote(
    CITY_MANAGER_ADDRESS,
    depositAssetIndex,
    depositAmount,
    noteId,
  );

  const nftTxn = createTransactionToSign(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender,
      to: receiver,
      amount: depositAmount,
      assetIndex: Number(influenceAssetIndex),
      note: new Uint8Array(Buffer.from(influenceDepositNote)),
      suggestedParams,
    }),
    undefined,
    TransactionToSignType.UserTransaction,
  );
  txns.push(nftTxn);

  return txns;
}
