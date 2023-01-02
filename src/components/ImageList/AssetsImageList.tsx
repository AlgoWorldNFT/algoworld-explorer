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

import { AlgoWorldAsset } from '@/models/AlgoWorldAsset';
import { useAppSelector } from '@/redux/store/hooks';
import { toIpfsProxyUrl } from '@/utils/toIpfsProxyUrl';
import {
  Button,
  Grow,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Image from 'next/image';

type Props = {
  assets: AlgoWorldAsset[];
};

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === `undefined`
    ? Buffer.from(str).toString(`base64`)
    : window.btoa(str);

const AssetsImageList = ({ assets }: Props) => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));
  const { gateway } = useAppSelector((state) => state.application);

  return (
    <ImageList gap={0} cols={largeScreen ? 4 : 1} sx={{ width: `100%` }}>
      {assets.map((item) => (
        <Grow key={item.index} in {...{ timeout: 1000 }}>
          <ImageListItem
            sx={{
              display: `flex`,
              width: `100%`,
              height: `100%`,
              justifyContent: `top`,
            }}
          >
            <Image
              src={toIpfsProxyUrl(item.url, gateway)}
              loading="lazy"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(700, 475),
              )}`}
              placeholder="blur"
              style={{
                maxWidth: '100%',
                minHeight: '475px',
                height: 'auto',
              }}
              width={700}
              height={475}
              alt={`AlgoWorld Card`}
            />
            <ImageListItemBar
              sx={{ textAlign: `center` }}
              title={item.name}
              subtitle={<span>ID: {item.index}</span>}
              position="below"
            />
            <Stack sx={{ pb: 2 }} direction={`row`} justifyContent="center">
              <Button
                size="small"
                variant="outlined"
                target="_blank"
                href={`https://algoexplorer.io/asset/${item.index}`}
              >
                AlgoExplorer
              </Button>
              <Button
                size="small"
                variant="outlined"
                target="_blank"
                href={`https://randgallery.com/algo-collection/?address=${item.index}`}
              >
                RandGallery
              </Button>
            </Stack>
          </ImageListItem>
        </Grow>
      ))}
    </ImageList>
  );
};

export default AssetsImageList;
