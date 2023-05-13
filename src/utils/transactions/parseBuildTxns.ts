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

import { BuildNote } from '@/models/BuildNote';

export default async function parseBuildTxns(
  txns: Record<string, any>[],
): Promise<BuildNote[]> {
  const processedTxns: BuildNote[] = [];

  for (const tx of txns) {
    try {
      const decodedNote = Buffer.from(tx[`note`], `base64`)
        .toString(`utf8`)
        .split(`_`);
      const noteContent = {
        prefix: decodedNote[0],
        receiver: decodedNote[1],
        assetIndex: Number(decodedNote[2]),
        deposit: Number(decodedNote[3]),
        object: decodedNote[4],
        noteId: decodedNote[5],
      } as BuildNote;
      processedTxns.push(noteContent);
    } catch (e) {
      continue;
    }
  }

  return processedTxns;
}
