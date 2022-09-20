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

import { IconButton, InputBase, Paper } from '@mui/material';

import ClearIcon from '@mui/icons-material/Clear';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

const SearchBar = ({ value, onValueChange, placeholder }: Props) => {
  return (
    <Paper
      component="form"
      sx={{
        width: `90%`,
        display: `flex`,
        alignItems: `center`,
      }}
    >
      <InputBase
        sx={{ ml: 2, flex: 1 }}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder ?? `Type to search`}
      />
      <IconButton
        disabled={!value}
        type="submit"
        sx={{ p: `10px` }}
        aria-label="search"
        onClick={() => onValueChange(``)}
      >
        <ClearIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
