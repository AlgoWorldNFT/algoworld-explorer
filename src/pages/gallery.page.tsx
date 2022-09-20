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
  Pagination,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PageHeader from '@/components/Headers/PageHeader';

import SearchBar from '@/components/SearchBars/SearchBar';
import { paginate } from '@/utils/paginate';
import { useEffect, useMemo, useState } from 'react';
import { AlgoWorldAsset } from '@/models/AlgoWorldAsset';

import { useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import { AlgoWorldCardType } from '@/models/AlgoWorldCardType';
import AssetsImageList from '@/components/ImageList/AssetsImageList';

const Gallery = () => {
  const chain = useAppSelector((state) => state.walletConnect.chain);
  const [cardType, setCardType] = useState(AlgoWorldCardType.COUNTRY);

  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));

  const assetsUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/feat/testnet/data/${chain.toLowerCase()}/${cardType.toLowerCase()}/database.json`;
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
  const rowsPerPage = 20;

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
