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
  Container,
  Grid,
  Grow,
  Pagination,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageHeader from '@/components/Headers/PageHeader';

import Image from 'next/image';
import SearchBar from '@/components/SearchBars/SearchBar';
import { paginate } from '@/utils/paginate';
import { useEffect, useMemo, useState } from 'react';
import { AlgoWorldAsset } from '@/models/AlgoWorldAsset';

import { useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import { AlgoWorldCardType } from '@/models/AlgoWorldCardType';
import AssetsImageList from '@/components/ImageList/AssetsImageList';
import { toIpfsProxyUrl } from '@/utils/toIpfsProxyUrl';
import { EMPTY_ASSET_IMAGE_URL } from '@/common/constants';

class Mulberry32 {
  constructor(private seed: number) {}

  random(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function getTodaySeed(): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  );
}

function getRandomObjects<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  const prng = new Mulberry32(getTodaySeed());
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(prng.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const Gallery = () => {
  const [cardType, setCardType] = useState(AlgoWorldCardType.COUNTRY);
  const { chain, gateway } = useAppSelector((state) => state.application);

  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));
  const smallScreen = useMediaQuery(theme.breakpoints.down(`sm`));

  const assetsUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/${cardType.toLowerCase()}/database.json`;
  }, [chain, cardType]);

  const assetsResponse = useSWR(assetsUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const assets: AlgoWorldAsset[] = useMemo(() => {
    if (assetsResponse.error || !assetsResponse.data) {
      return [];
    }

    return assetsResponse.data;
  }, [assetsResponse.data, assetsResponse.error]);

  const [currentAssets, setCurrentAssets] = useState(assets);

  const [searchValue, setSearchValue] = useState(``);
  const [page, setPage] = useState(0);
  const rowsPerPage = 8;

  const featuredAssets = useMemo(
    () => getRandomObjects(currentAssets, 3),
    [currentAssets],
  );

  useMemo(() => {
    if (searchValue.length > 0) {
      setPage(0);
      setCurrentAssets(
        assets.filter(
          (asset) =>
            asset.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            String(asset.index).includes(searchValue.toLowerCase()),
        ),
      );
    } else {
      setPage(0);
      setCurrentAssets(assets);
    }
  }, [assets, searchValue]);

  useEffect(() => {
    return () => {
      setPage(0);
      setSearchValue(``);
    };
  }, []);

  return (
    <div>
      <Paper>
        <PageHeader
          title="⭐ Featured"
          description="Randomly featured AlgoWorld NFTs"
        />

        {featuredAssets.length === 3 && (
          <Grow in {...{ timeout: 750 }}>
            <Stack direction={`row`} justifyContent={`space-evenly`}>
              {featuredAssets.map((city) => {
                return (
                  <Image
                    key={city.index}
                    src={toIpfsProxyUrl(city.url, gateway)}
                    loading="eager"
                    blurDataURL={EMPTY_ASSET_IMAGE_URL(gateway)}
                    placeholder="blur"
                    width={largeScreen ? 200 : 110}
                    height={largeScreen ? 350 : 130}
                    style={{
                      height: `auto`,
                    }}
                    alt={`AlgoWorld Card`}
                  />
                );
              })}
            </Stack>
          </Grow>
        )}
      </Paper>
      <br />
      <PageHeader title="🏠 Gallery" description="Explore all AlgoWorld NFTs" />

      <Container
        component="main"
        sx={{
          pb: 15,
          pl: largeScreen ? 15 : 2,
          pr: largeScreen ? 15 : 2,
        }}
      >
        <Stack
          direction={`column`}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <SearchBar
            onValueChange={setSearchValue}
            value={searchValue}
            placeholder="Search asset by index or title..."
          />

          <ToggleButtonGroup
            color="primary"
            value={cardType}
            sx={{
              pt: 2,
              justifyContent: `center`,
              width: `100%`,
              flexDirection: smallScreen ? `column` : `row`, // Adjust the direction based on the screen size
            }}
            exclusive
            defaultChecked
            onChange={(_, value) => {
              {
                if (value) setCardType(value as AlgoWorldCardType);
              }
            }}
          >
            <ToggleButton value={AlgoWorldCardType.COUNTRY}>
              🌍 Countries
            </ToggleButton>
            <ToggleButton value={AlgoWorldCardType.CITY}>
              🌃 Cities
            </ToggleButton>
            <ToggleButton value={AlgoWorldCardType.SPECIAL}>
              🎴 Special Cards
            </ToggleButton>
          </ToggleButtonGroup>

          {currentAssets.length > rowsPerPage && (
            <Grid
              container
              sx={{ pt: 2, maxWidth: `400px` }}
              justifyContent="center"
              alignItems="center"
            >
              <Pagination
                siblingCount={0}
                shape="rounded"
                variant="outlined"
                color="primary"
                count={Math.ceil(currentAssets.length / rowsPerPage)}
                page={page + 1}
                onChange={(_, value) => {
                  setPage(value - 1);
                }}
              />
            </Grid>
          )}
        </Stack>

        <Container
          component="form"
          sx={{
            pt: 2,
            width: `100%`,
          }}
        >
          <AssetsImageList
            assets={paginate(currentAssets, rowsPerPage, page + 1)}
          />
        </Container>
      </Container>
    </div>
  );
};

export default Gallery;
