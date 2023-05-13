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
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Image from 'next/image';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  getAccountAssets,
  selectAssets,
  switchChain,
  getInfluenceDepositTxns,
  getBuildTxns,
  getPendingBuildTxns,
  setGateway,
} from '@/redux/slices/applicationSlice';
import { Asset } from '@/models/Asset';
import { BlockNote } from '@/models/BlockNote';
import {
  setIsAboutPopupOpen,
  setIsWalletPopupOpen,
} from '@/redux/slices/applicationSlice';
import { useRouter } from 'next/router';
import {
  Divider,
  FormControlLabel,
  Grid,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChainType } from '@/models/Chain';
import Link from 'next/link';
import {
  CITY_MANAGER_ADDRESS,
  BUILD_MANAGER_ADDRESS,
} from '@/common/constants';
import createAlgoExplorerUrl from '@/utils/createAlgoExplorerUrl';
import formatBigNumWithDecimals from '@/utils/formatBigNumWithDecimals';
import AlgoExplorerUrlType from '@/models/AlgoExplorerUrlType';
import {
  NAV_BAR_CHAIN_FORM_CONTROL_ID,
  NAV_BAR_CHAIN_SWITCH_ID,
  NAV_BAR_CONNECT_BTN_ID,
  NAV_BAR_HOME_BTN_ID,
  NAV_BAR_ICON_HOME_BTN_ID,
  NAV_BAR_ID,
  NAV_BAR_MENU_APPBAR_ID,
  NAV_BAR_MENU_APPBAR_ITEM_ID,
  NAV_BAR_SETTINGS_BTN_ID,
  NAV_BAR_SETTINGS_MENU_ITEM_ID,
} from './constants';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import ValueSelect from '../Select/ValueSelect';
import { IpfsGateway } from '@/models/Gateway';
import ConnectProviderDialog from '../Dialogs/ConnectProviderDialog';
import getNFDsForAddress from '@/utils/accounts/getNFDsForAddress';
import { useAsync } from 'react-use';
import { useWallet } from '@txnlab/use-wallet';
import { ellipseText, ellipseAddress } from '@/redux/helpers/utilities';
import useSWR from 'swr';

type PageConfiguration = {
  title: string;
  url: string;
  target?: string;
  disabled?: boolean;
};

const pages = [
  { title: `Gallery`, url: `/gallery` },
  { title: `Build an AlgoWorld`, url: `/build` },
  { title: `Leaderboard`, url: `/leaderboard` },
  { title: `Packs`, url: `/packs` },
  { title: `Docs`, url: `https://docs.algoworld.io`, target: `_blank` },
] as PageConfiguration[];

type MenuBarSettingItem = {
  label: string;
  icon: any;
};

const settings: MenuBarSettingItem[] = [
  { label: `AlgoExplorer`, icon: SearchIcon },
  { label: `My Transactions`, icon: ReceiptIcon },
  { label: `Logout`, icon: LogoutIcon },
];
const BUG_REPORT_URL = `https://github.com/AlgoWorldNFT/algoworld-explorer/issues/new`;

const NavBar = () => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up(`sm`));

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );
  const router = useRouter();
  const { chain } = router.query as {
    chain?: string;
  };

  const assets = useAppSelector(selectAssets);

  const {
    fetchingAccountAssets: loading,
    chain: selectedChain,
    gateway,
  } = useAppSelector((state) => state.application);

  const { isWalletPopupOpen, isAboutPopupOpen } = useAppSelector(
    (state) => state.application,
  );

  const { providers, activeAddress } = useWallet();

  const activeProvider = React.useMemo(() => {
    return providers?.find((p) => p.isActive);
  }, [providers]);

  const nfdState = useAsync(async () => {
    if (!activeAddress) {
      return;
    }
    const nfd = await getNFDsForAddress(activeAddress, selectedChain);
    return nfd;
  }, [activeAddress, selectedChain]);

  const nfd = React.useMemo(() => {
    if (nfdState.loading || nfdState.error) {
      return null;
    }

    return nfdState.value;
  }, [nfdState.error, nfdState.loading, nfdState.value]);

  const nfdAvatar = React.useMemo(() => {
    return nfd?.properties?.userDefined?.avatar;
  }, [nfd]);

  const dispatch = useAppDispatch();

  const disconnect = async () => {
    await activeProvider
      ?.disconnect()
      .catch((err: { message: any }) => console.error(err.message));
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleClickUserMenu = async (event: any) => {
    setAnchorElUser(null);

    if (!event || !event.target) {
      return;
    }

    if (event.target.textContent === `AlgoExplorer` && activeAddress) {
      window.open(
        createAlgoExplorerUrl(
          selectedChain,
          activeAddress,
          AlgoExplorerUrlType.Address,
        ),
        `_blank`,
      );
    }

    if (event.target.textContent === `My Transactions`) {
      router.push(`/my-transactions`);
    }

    if (event.target.textContent === `Logout`) {
      await disconnect();
    }
  };

  /*  */
  const lastblockUrl = React.useMemo(() => {
    return `https://raw.githubusercontent.com/AlgoWorldNFT/algoworld-workers/${selectedChain.toLowerCase()}/data/${selectedChain.toLowerCase()}/aw_build/metadata.json`;
  }, [selectedChain]);

  const lastblockResponse = useSWR(lastblockUrl, (url: string) => {
    return fetch(url).then((res) => res.json());
  });

  const processedlastblock: BlockNote = React.useMemo(() => {
    if (lastblockResponse.error || !lastblockResponse.data) {
      return {};
    }
    return lastblockResponse.data;
  }, [lastblockResponse]);
  /* end of code added 0410 */

  useEffect(() => {
    const changeChain = (chain: ChainType) => {
      dispatch(switchChain(chain));
    };

    const changeGateway = (gateway: IpfsGateway) => {
      dispatch(setGateway(gateway));
    };

    if (typeof window !== `undefined`) {
      const persistedChainType = localStorage.getItem(`ChainType`) as ChainType;

      const selectedChainType = chain
        ? (chain as ChainType)
        : persistedChainType;

      if (selectedChainType) {
        changeChain(selectedChainType);
      }

      const persistedGateway = localStorage.getItem(
        `IpfsGateway`,
      ) as IpfsGateway;
      if (persistedGateway) {
        changeGateway(persistedGateway);
      }
    }

    /*  */
    if (processedlastblock[`last_processed_block`]) {
      dispatch(
        getPendingBuildTxns({
          chain: selectedChain,
          block: processedlastblock[`last_processed_block`],
          managerAddress: BUILD_MANAGER_ADDRESS,
        }),
      );
    }

    if (activeAddress) {
      dispatch(
        getAccountAssets({
          chain: selectedChain,
          address: activeAddress,
          gateway,
        }),
      );
      dispatch(
        getInfluenceDepositTxns({
          chain: selectedChain,
          address: activeAddress,
          managerAddress: CITY_MANAGER_ADDRESS,
        }),
      );
      dispatch(
        getBuildTxns({
          chain: selectedChain,
          address: activeAddress,
          managerAddress: BUILD_MANAGER_ADDRESS,
        }),
      );
    }
  }, [
    dispatch,
    processedlastblock,
    activeAddress,
    selectedChain,
    chain,
    gateway,
  ]);

  const nativeCurrency = assets.find(
    (asset: Asset) => asset.index === 0,
  ) as Asset;

  const openBugReport = () => {
    window.open(BUG_REPORT_URL, `_blank`);
  };

  return (
    <>
      <ConnectProviderDialog open={isWalletPopupOpen} />
      <AppBar sx={{ background: `#000000` }} id={NAV_BAR_ID} position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Link legacyBehavior href="/gallery">
              <IconButton
                id={NAV_BAR_ICON_HOME_BTN_ID}
                size="medium"
                sx={{ display: { xs: `none`, md: `flex` }, mr: 1 }}
                aria-label="home icon"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <Image
                  src="/algoworld_logo.svg"
                  alt="AlgoWorld Explorer Logo"
                  height={40}
                  width={40}
                />
              </IconButton>
            </Link>

            <Box sx={{ flexGrow: 1, display: { xs: `flex`, md: `none` } }}>
              <IconButton
                id={NAV_BAR_HOME_BTN_ID}
                size="large"
                aria-label="home button"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <Image
                  src="/algoworld_logo.svg"
                  alt="AlgoWorld Explorer Logo"
                  height={40}
                  width={40}
                />
              </IconButton>
              <Menu
                id={NAV_BAR_MENU_APPBAR_ID}
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: `bottom`,
                  horizontal: `left`,
                }}
                keepMounted
                transformOrigin={{
                  vertical: `top`,
                  horizontal: `left`,
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: `block`, md: `none` },
                }}
              >
                {pages.map((page) => (
                  <Link
                    legacyBehavior
                    id={NAV_BAR_MENU_APPBAR_ITEM_ID(page.title)}
                    key={page.title}
                    href={page.url}
                    passHref
                  >
                    <MenuItem
                      onClick={() => {
                        handleCloseNavMenu();
                      }}
                    >
                      <Typography textAlign="center">{page.title}</Typography>
                    </MenuItem>
                  </Link>
                ))}
                <MenuItem
                  id={NAV_BAR_MENU_APPBAR_ITEM_ID(`about`)}
                  key={`about`}
                  onClick={() => {
                    dispatch(setIsAboutPopupOpen(!isAboutPopupOpen));
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">{`About`}</Typography>
                </MenuItem>
                <MenuItem
                  id={NAV_BAR_MENU_APPBAR_ITEM_ID(`bug`)}
                  key={`bug`}
                  onClick={() => {
                    openBugReport();
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">{`Bug report`}</Typography>
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: `none`, md: `flex` } }}>
              {pages.map((page) => (
                <Link
                  legacyBehavior
                  id={NAV_BAR_MENU_APPBAR_ITEM_ID(page.title)}
                  key={page.title}
                  href={page.url}
                  passHref
                >
                  <Button
                    key={page.title}
                    disabled={page.disabled}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: `white`, display: `block` }}
                  >
                    {page.title}
                  </Button>
                </Link>
              ))}
              <Button
                id={NAV_BAR_MENU_APPBAR_ITEM_ID(`about`)}
                key={`about`}
                onClick={() => {
                  dispatch(setIsAboutPopupOpen(!isAboutPopupOpen));
                }}
                sx={{ my: 2, color: `white`, display: `block` }}
              >
                About
              </Button>
              <Button
                id={NAV_BAR_MENU_APPBAR_ITEM_ID(`bug`)}
                key={`bug`}
                onClick={() => {
                  openBugReport();
                }}
                sx={{ my: 2, color: `white`, display: `block` }}
              >
                Bug report
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {activeAddress ? (
                <>
                  <Grid container alignItems={`center`} spacing={1}>
                    <Grid item xs>
                      {!loading && (
                        <Tooltip title="Available balance">
                          <Stack
                            direction={`column`}
                            sx={{
                              alignItems: `center`,
                              display: { xs: `none`, md: `flex` },
                            }}
                          >
                            <Typography variant="subtitle2">
                              {formatBigNumWithDecimals(
                                BigInt(nativeCurrency.amount),
                                nativeCurrency.decimals,
                              )}
                              {` `}
                              {nativeCurrency.unitName || `units`}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {`${
                                selectedChain === `mainnet`
                                  ? `MainNet`
                                  : `TestNet`
                              }`}
                            </Typography>
                          </Stack>
                        </Tooltip>
                      )}
                    </Grid>
                    <Grid item xs>
                      <Tooltip title="Open settings">
                        <IconButton
                          id={NAV_BAR_SETTINGS_BTN_ID}
                          onClick={handleOpenUserMenu}
                          sx={{ p: 0, borderRadius: 1 }}
                        >
                          {nfd && nfdAvatar && (
                            <div
                              style={{
                                borderRadius: `50%`,
                                overflow: `hidden`,
                                width: `40px`,
                                height: `40px`,
                              }}
                            >
                              <Image
                                src={nfdAvatar}
                                alt="nfd-profile"
                                width={40}
                                height={40}
                                placeholder="blur"
                                blurDataURL={nfdAvatar}
                              />
                            </div>
                          )}
                          <Typography sx={{ pl: nfd ? 1 : 0 }} variant="h6">
                            {`${
                              nfd
                                ? ellipseText(nfd.name, 20)
                                : ellipseAddress(activeAddress, 4)
                            }`}
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Menu
                    sx={{ mt: `45px` }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: `top`,
                      horizontal: `right`,
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: `top`,
                      horizontal: `right`,
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {!largeScreen && (
                      <Typography
                        variant="subtitle2"
                        sx={{ textAlign: `center`, color: `primary.main` }}
                      >
                        {formatBigNumWithDecimals(
                          BigInt(nativeCurrency.amount),
                          nativeCurrency.decimals,
                        )}
                        {` `}
                        {nativeCurrency.unitName || `units`}
                      </Typography>
                    )}

                    <ValueSelect
                      id={NAV_BAR_CHAIN_SWITCH_ID}
                      label={`Network type`}
                      value={selectedChain}
                      values={[ChainType.TestNet, ChainType.MainNet]}
                      onSelect={(value: string) => {
                        dispatch(switchChain(value as ChainType));
                      }}
                    />
                    <Divider />
                    <ValueSelect
                      label={`IPFS Gateway`}
                      value={gateway}
                      values={[
                        IpfsGateway.ALGONODE_IO,
                        IpfsGateway.DWEB_LINK,
                        IpfsGateway.IPFS_IO,
                        IpfsGateway.CLOUDFLARE_IPFS,
                      ]}
                      onSelect={(value: string) => {
                        dispatch(setGateway(value as IpfsGateway));
                      }}
                    />
                    <Divider />
                    <ValueSelect
                      label={`Active account`}
                      value={ellipseAddress(activeAddress)}
                      values={
                        activeProvider?.accounts.map((account) => {
                          return ellipseAddress(account.address);
                        }) || []
                      }
                      rawValues={
                        activeProvider?.accounts.map((account) => {
                          return account.address;
                        }) || []
                      }
                      onSelect={async (value: string) => {
                        await activeProvider?.setActiveAccount(value);
                      }}
                    />
                    {settings.map((setting) => (
                      <MenuItem
                        id={NAV_BAR_SETTINGS_MENU_ITEM_ID(setting.label)}
                        sx={{ justifyContent: `center` }}
                        key={setting.label}
                        onClick={handleClickUserMenu}
                      >
                        <ListItemIcon>
                          <setting.icon />
                        </ListItemIcon>
                        <ListItemText>{setting.label}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Stack
                  direction="column"
                  sx={{
                    alignItems: `center`,
                    pb: 1,
                    pt: 1,
                  }}
                >
                  <FormControlLabel
                    labelPlacement="start"
                    id={NAV_BAR_CHAIN_FORM_CONTROL_ID}
                    control={
                      <Switch
                        id={NAV_BAR_CHAIN_SWITCH_ID}
                        size="small"
                        checked={selectedChain === ChainType.MainNet}
                        onChange={() => {
                          const newValue =
                            selectedChain === ChainType.MainNet
                              ? ChainType.TestNet
                              : ChainType.MainNet;

                          dispatch(switchChain(newValue));
                        }}
                      />
                    }
                    sx={{ color: `primary.main` }}
                    label={
                      selectedChain === ChainType.MainNet
                        ? `MainNet`
                        : `TestNet`
                    }
                  />
                  <Button
                    id={NAV_BAR_CONNECT_BTN_ID}
                    onClick={() => {
                      dispatch(setIsWalletPopupOpen(true));
                    }}
                    title="Connect Wallet"
                  >
                    Connect Wallet
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBar;
