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

import { Asset } from '@/models/Asset';
import { CityPackAsa } from '@/models/CityPack';

export default function getPackAssetsToOptIn(
  packAssets: CityPackAsa[],
  existingAssets: Asset[],
) {
  const newAssetIndexes = packAssets.map((packAsset) => packAsset.id);
  const existingAssetIndexes = existingAssets.map((asset) => asset.index);

  const indexesToOptIn = [];

  for (const index of newAssetIndexes) {
    if (!existingAssetIndexes.includes(index)) {
      indexesToOptIn.push(index);
    }
  }

  return indexesToOptIn;
}
