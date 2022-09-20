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

import { PackPurchaseNote } from '@/models/PackPurchaseNote';

export default async function parsePackPurchaseTxn(
  txns: Record<string, any>[],
): Promise<PackPurchaseNote[]> {
  const processedTxns: PackPurchaseNote[] = [];

  for (const tx of txns) {
    try {
      if (
        !(
          `payment-transaction` in tx &&
          tx[`payment-transaction`][`receiver`] ===
            `TSYD5NUVJZLYB3MDFZSAVCSXDDH3ZABDDUARUDAWTU7KVMNVHCH2NQOYWE`
        )
      ) {
        continue;
      }

      const decodedNote = Buffer.from(tx[`note`], `base64`)
        .toString(`utf8`)
        .split(`_`);
      const noteContent = {
        prefix: decodedNote[0],
        operation: decodedNote[1],
        packId: Number(decodedNote[2]),
        buyerAddress: decodedNote[3],
        txId: tx[`id`],
      } as PackPurchaseNote;
      processedTxns.push(noteContent);
    } catch (e) {
      continue;
    }
  }

  return processedTxns;
}
