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

import { BUILD_MANAGER_ADDRESS, OWNER_FEE_PC } from '@/common/constants';
import { ChainType } from '@/models/Chain';
import { TransactionToSignType } from '@/models/Transaction';
import algosdk from 'algosdk';
import createBuildNote from './createBuildNote';
import createTransactionToSign from './createTransactionToSign';
import getTransactionParams from './getTransactionParams';
import { v4 as uuidv4 } from 'uuid';

export default async function createBuildTxns(
  chain: ChainType,
  sender: string,
  receiver: string,
  fundingFee: number,
  depositAmount: number,
  objecttype: string,
  depositAssetIndex: number,
  owner: string,
  AWTIndex: number,
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
          `I am a fee transaction for covering a fee that will be spend by manager wallet to update ARC69 tag within next minutes :-)`,
        ),
      ),
      suggestedParams,
    }),
    undefined, // TODO: refactor
    TransactionToSignType.UserFeeTransaction,
  );

  txns.push(feeTxn);

  const noteId = uuidv4();
  const BuildNote = createBuildNote(
    BUILD_MANAGER_ADDRESS,
    depositAssetIndex,
    depositAmount,
    objecttype,
    noteId,
  );

  const nftTxn = createTransactionToSign(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender,
      to: receiver,
      amount: Math.floor(depositAmount * (1 - OWNER_FEE_PC)),
      assetIndex: Number(AWTIndex),
      note: new Uint8Array(Buffer.from(BuildNote)),
      suggestedParams,
    }),
    undefined,
    TransactionToSignType.UserTransaction,
  );
  txns.push(nftTxn);

  const ownerTxn = createTransactionToSign(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender,
      to: owner,
      amount: Math.floor(depositAmount * OWNER_FEE_PC),
      assetIndex: Number(AWTIndex),
      note: new Uint8Array(
        Buffer.from(
          `AWT fee coming from a construction on your AlgoWorld Tile!`,
        ),
      ),
      suggestedParams,
    }),
    undefined,
    TransactionToSignType.UserTransaction,
  );
  txns.push(ownerTxn);

  return txns;
}
