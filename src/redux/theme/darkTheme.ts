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

import { createTheme } from '@mui/material';

/* istanbul ignore next */
const darkTheme = createTheme({
  typography: {
    fontFamily: `"JetBrains Mono", monospace`,
  },
  palette: {
    mode: `dark`,
    primary: {
      main: `#ffffff`,
    },
    secondary: {
      main: `#ff80bf`,
    },
    background: {
      default: `#000000`,
      paper: `#000000`,
    },
    text: {
      primary: `#f8f8f2`,
    },
    error: {
      main: `#FF9580`,
    },
    warning: {
      main: `#FFFF80`,
    },
    info: {
      main: `#80FFEA`,
    },
    success: {
      main: `#8aff80`,
    },
  },
});

export default darkTheme;
