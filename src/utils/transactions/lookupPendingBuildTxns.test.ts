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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { ChainType } from '@/models/Chain';
import { indexerForChain } from '@/utils/algorand';
import lookupPendingBuildTxns from './lookupPendingBuildTxns';

jest.mock(`@/utils/algorand`);

describe(`lookupPendingBuildTxns`, () => {
  const mockResponse = {
    transactions: [
      { id: 1, note: `test` }, // mock transaction data
    ],
  };
  const mockIndexerClient = {
    lookupAccountTransactions: jest.fn().mockReturnThis(),
    txType: jest.fn().mockReturnThis(),
    notePrefix: jest.fn().mockReturnThis(),
    minRound: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    nextToken: jest.fn().mockReturnThis(),
    do: jest.fn().mockResolvedValue(mockResponse),
  };

  beforeAll(() => {
    (indexerForChain as jest.Mock).mockReturnValue(mockIndexerClient);
  });

  beforeEach(() => {
    mockIndexerClient.do.mockClear();
  });

  it(`returns an array of transactions when given valid inputs`, async () => {
    const chain = ChainType.MainNet;
    const block = 12345;
    const managerAddr = `test-manager-addr`;
    const expectedTxns = mockResponse.transactions;

    const actualTxns = await lookupPendingBuildTxns(chain, block, managerAddr);

    expect(actualTxns).toEqual(expectedTxns);
    expect(mockIndexerClient.lookupAccountTransactions).toHaveBeenCalledWith(
      managerAddr,
    );
    expect(mockIndexerClient.txType).toHaveBeenCalledWith(`axfer`);
    expect(mockIndexerClient.notePrefix).toHaveBeenCalledWith(
      `YXdlYnVpbGRfdGVzdC1tYW5hZ2VyLWFkZHI=`,
    );
    expect(mockIndexerClient.minRound).toHaveBeenCalledWith(block);
    expect(mockIndexerClient.limit).toHaveBeenCalledWith(100);
    expect(mockIndexerClient.do).toHaveBeenCalledTimes(1);
  });

  it(`returns an empty array when an error is thrown`, async () => {
    const chain = ChainType.TestNet;
    const block = 67890;
    const managerAddr = `test-manager-addr`;

    (mockIndexerClient.do as jest.Mock).mockRejectedValue(
      new Error(`mock error`),
    );

    const actualTxns = await lookupPendingBuildTxns(chain, block, managerAddr);

    expect(actualTxns).toEqual([]);
    expect(mockIndexerClient.lookupAccountTransactions).toHaveBeenCalledWith(
      managerAddr,
    );
    expect(mockIndexerClient.txType).toHaveBeenCalledWith(`axfer`);
    expect(mockIndexerClient.notePrefix).toHaveBeenCalledWith(
      `YXdlYnVpbGRfdGVzdC1tYW5hZ2VyLWFkZHI=`,
    );
    expect(mockIndexerClient.minRound).toHaveBeenCalledWith(block);
    expect(mockIndexerClient.limit).toHaveBeenCalledWith(100);
    expect(mockIndexerClient.do).toHaveBeenCalledTimes(1);
  });
});
