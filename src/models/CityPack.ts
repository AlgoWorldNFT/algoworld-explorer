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

export enum CityPackType {
  Available = `available`,
  Purchased = `purchased`,
}

export type CityPackAsa = {
  id: number;
  amount: number;
  decimals: number;
  title: string;
  url: string;
};

export type CityPack = {
  id: number;
  creator: string;
  escrow: string;
  contract: string;
  title: string;
  offered_asas: [CityPackAsa];
  requested_algo_amount: number;
  requested_algo_wallet: string;
  is_active: boolean;
  is_closed: boolean;
  last_swap_tx: string;
};
