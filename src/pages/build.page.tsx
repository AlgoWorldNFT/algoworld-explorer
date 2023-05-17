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

import { Container, useMediaQuery, useTheme } from '@mui/material';
import PageHeader from '@/components/Headers/PageHeader';

import { useMemo } from 'react';
import { MapAsset } from '@/models/MapAsset';
import { useAppSelector } from '@/redux/store/hooks';
import useSWR from 'swr';
import MapList from '@/components/ImageList/MapList';
import { Link as MuiLink } from '@mui/material';

const Build = () => {
  const chain = useAppSelector((state) => state.application.chain);

  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));

  const assetsUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${chain.toLowerCase()}/data/${chain.toLowerCase()}/aw_build/database.json`;
  }, [chain]);

  const assetsResponse = useSWR(assetsUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const assets: MapAsset[] = useMemo(() => {
    if (assetsResponse.error || !assetsResponse.data) {
      return [];
    }

    return assetsResponse.data;
  }, [assetsResponse.data, assetsResponse.error]);

  const pendingBuildTxnNotes = useAppSelector(
    (state) => state.application.pendingBuildTxnNotes,
  );

  const assets_pending: MapAsset[] = useMemo(() => {
    const assets_pending_temp: MapAsset[] = assets.map((item) => ({ ...item }));

    /* update the tiles with the latest transactions */
    pendingBuildTxnNotes
      .slice()
      .reverse()
      .forEach((note) => {
        if (assets_pending_temp.length > 0) {
          if (
            `object` in assets_pending_temp[note.assetIndex - 1] &&
            `builder` in assets_pending_temp[note.assetIndex - 1]
          ) {
            assets_pending_temp[note.assetIndex - 1].object =
              note.object.concat(`_pending`);
            assets_pending_temp[note.assetIndex - 1].builder = `PENDING...`;
          }
        }
      });
    return assets_pending_temp;
  }, [assets, pendingBuildTxnNotes]);

  return (
    <div>
      <PageHeader
        title="🛠 Build an AlgoWorld"
        description="A cooperative building experience."
      />

      <Container
        component="main"
        sx={{
          pb: 10,
          pl: largeScreen ? 15 : 2,
          pr: largeScreen ? 15 : 2,
          borderRadius: 5,
        }}
      >
        <MapList tiles={assets_pending} />
      </Container>
      <Container
        component="main"
        sx={{
          pb: 15,
          pl: largeScreen ? 15 : 2,
          pr: largeScreen ? 15 : 2,
          borderRadius: 5,
          fontStyle: `oblique`,
          fontSize: 15,
        }}
      >
        <div>
          What is Build an AlgoWorld?
          <br />
          <br />
          Build an AlogWorld is a feature that allows you to build your
          constructions on a common map by using your AlgoWorld Tokens. Each
          tile is an NFT you can own. Owning a tile will get you 50% of every
          construction fee on your tile.
          <br />
          <br />
          1,000 AWT are sent daily and shared between builders of a House or
          Castle. You will get a bonus by building Meadow, Water and Forest
          tiles.
          <br />
          Defend your tiles and conquer other territories!
          <br />
          <br />
          Get more details on{` `}
          <MuiLink
            color="inherit"
            target="_blank"
            rel="noopener"
            href="https://algoworld.io"
          >
            algoworld.io
          </MuiLink>
          ,{` `}
          <MuiLink
            color="inherit"
            target="_blank"
            rel="noopener"
            href="https://t.me/algoworld_nft"
          >
            Telegram
          </MuiLink>
          ,{` `}or{` `}
          <MuiLink
            color="inherit"
            target="_blank"
            rel="noopener"
            href="https://t.co/mKeMHwRuD7"
          >
            Discord
          </MuiLink>
          .
        </div>
      </Container>
    </div>
  );
};

export default Build;
