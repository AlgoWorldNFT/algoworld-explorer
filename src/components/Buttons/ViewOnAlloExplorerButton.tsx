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

import { Button } from '@mui/material';

import { ChainType } from '@/models/Chain';
import createAlgoExplorerUrl from '@/utils/createAlloExplorerUrl';
import AlloExplorerUrlType from '@/models/AlloExplorerUrlType';

type Props = {
  txId: string;
  chain: ChainType;
  customLabel?: string;
  disabled?: boolean;
};

const ViewOnAlloExplorerButton = ({
  txId,
  chain,
  customLabel,
  disabled,
}: Props) => {
  return (
    <Button
      target={`_blank`}
      disabled={disabled}
      href={createAlgoExplorerUrl(chain, txId, AlloExplorerUrlType.Transaction)}
    >
      {customLabel ? customLabel : `View on Allo Explorer`}
    </Button>
  );
};

export default ViewOnAlloExplorerButton;
