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
  CITY_PACK_INCENTIVE_FEE,
  CITY_PACK_INCENTIVE_WALLET,
} from '@/common/constants';
import { ChainType } from '@/models/Chain';
import { CityPack } from '@/models/CityPack';
import { TransactionToSignType } from '@/models/Transaction';
import algosdk from 'algosdk';
import getLogicSign from '../accounts/getLogicSignature';
import createTransactionToSign from './createTransactionToSign';
import getTransactionParams from './getTransactionParams';

export default async function createPerformPackPurchaseTxns(
  chain: ChainType,
  userAddress: string,
  pack: CityPack,
) {
  const suggestedParams = await getTransactionParams(chain);

  const escrowLsig = getLogicSign(pack.contract);
  const txns = [];
  const feeNote = `I am a asset transfer transaction to perform swap. thank you for using AlgoWorld Explorer! :-)`;

  const incentiveFeeTxn = createTransactionToSign(
    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: userAddress,
      to: CITY_PACK_INCENTIVE_WALLET,
      amount: CITY_PACK_INCENTIVE_FEE,
      note: new Uint8Array(Buffer.from(feeNote)),
      suggestedParams,
    }),
    undefined,
    TransactionToSignType.UserFeeTransaction,
  );
  txns.push(incentiveFeeTxn);

  const packPurchaseNote = `awe_pp_${pack.id}_${userAddress}`;

  const requestedAlgoTxn = createTransactionToSign(
    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: userAddress,
      to: pack.creator,
      amount: pack.requested_algo_amount,
      note: new Uint8Array(Buffer.from(packPurchaseNote)),
      suggestedParams,
    }),
    undefined,
    TransactionToSignType.UserTransaction,
  );
  txns.push(requestedAlgoTxn);

  for (const asset of pack.offered_asas) {
    const offeredAsaXferTxn = createTransactionToSign(
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: escrowLsig.address(),
        to: userAddress,
        amount: asset.amount * Math.pow(10, asset.decimals),
        assetIndex: asset.id,
        note: new Uint8Array(Buffer.from(feeNote)),
        suggestedParams,
      }),
      escrowLsig,
      TransactionToSignType.LsigTransaction,
    );

    txns.push(offeredAsaXferTxn);
  }

  return txns;
}
