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

import React from 'react';
import { Stack, Typography } from '@mui/material';

const MaintenanceLayout = () => {
  return (
    <Stack alignItems="center" direction="column" sx={{ pt: 20 }}>
      <Typography variant="h4" component="h2">
        ⚠️ Maintenance ⚠️
      </Typography>
      <Typography variant="h5" component="h2">
        Please, check back later...
      </Typography>
    </Stack>
  );
};
export default MaintenanceLayout;
