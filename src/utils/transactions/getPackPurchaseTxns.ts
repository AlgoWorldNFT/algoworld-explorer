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
import { indexerForChain } from '@/utils/algorand';

export default async function getPackPurchaseTxns(
  chain: ChainType,
  address?: string,
): Promise<Record<string, any>[]> {
  try {
    // base64 encode string
    const maxResults = 100;

    const operation = `pp`;
    const encodedPrefix = Buffer.from(`awe_${operation}_`).toString(`base64`);

    let request = indexerForChain(chain)
      .searchForTransactions()
      .address(CITY_MANAGER_ADDRESS)
      .txType(`pay`)
      .notePrefix(encodedPrefix)
      .limit(maxResults);

    if (address) {
      request = request.address(address);
    }

    let response = await request.do();

    const txns = [];

    if (`transactions` in response && response[`transactions`].length > 0) {
      txns.push(...response[`transactions`]);

      while (`next-token` in response) {
        response = indexerForChain(chain)
          .searchForTransactions()
          .address(CITY_MANAGER_ADDRESS)
          .txType(`pay`)
          .notePrefix(encodedPrefix)
          .limit(maxResults)
          .nextToken(response[`next-token`]);

        if (address) {
          response = response.address(address);
        }

        response = await response.do();

        if (`transactions` in response && response[`transactions`].length > 0) {
          txns.push(...response[`transactions`]);
        } else {
          continue;
        }
      }
    }

    console.log(txns);
    return txns;
  } catch (e) {
    return [];
  }
}
