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

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ButtonBase, CardMedia } from '@mui/material';
import { CityPack } from '@/models/CityPack';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { stringToHexColor } from '@/utils/stringToHexColor';
import { setIsWalletPopupOpen } from '@/redux/slices/applicationSlice';
import { CITY_PACK_IMAGE_URL } from '@/common/constants';

type Props = {
  pack: CityPack;
  purchaseClicked: (pack: CityPack) => void;
};

const PackCard = ({ pack, purchaseClicked }: Props) => {
  const { address, gateway } = useAppSelector((state) => state.walletConnect);
  const dispatch = useAppDispatch();

  return (
    <Card
      sx={{
        height: `100%`,
        display: `flex`,
        flexDirection: `column`,
      }}
    >
      <ButtonBase
        sx={{ display: `block`, textAlign: `initial` }}
        onClick={() => {
          address
            ? purchaseClicked(pack)
            : dispatch(setIsWalletPopupOpen(true));
        }}
      >
        <CardMedia
          component={`img`}
          sx={{
            backgroundColor: `${stringToHexColor(pack.escrow)}`,
          }}
          image={CITY_PACK_IMAGE_URL(gateway)}
          alt="random"
        />
        <CardContent sx={{ flexGrow: 1, textAlign: `center` }}>
          <Typography
            sx={{ fontWeight: `bold` }}
            gutterBottom
            variant="h5"
            component="h2"
          >
            {pack.title}
          </Typography>
          <Typography>{`Price: ${
            pack.requested_algo_amount / 1e6
          } Algo`}</Typography>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default PackCard;
