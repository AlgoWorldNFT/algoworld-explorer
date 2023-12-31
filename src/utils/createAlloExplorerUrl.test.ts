import AlloExplorerUrlType from '@/models/AlloExplorerUrlType';
import { ChainType } from '@/models/Chain';
import createAlgoExplorerUrl from '@/utils/createAlloExplorerUrl';

describe(`createAlloExplorerUrl()`, () => {
  it.each([
    [
      `test`,
      ChainType.MainNet,
      AlloExplorerUrlType.Address,
      `https://allo.info/address/test`,
    ],
    [
      `test`,
      ChainType.MainNet,
      AlloExplorerUrlType.Asset,
      `https://allo.info/asset/test`,
    ],
    [
      `test`,
      ChainType.MainNet,
      AlloExplorerUrlType.Transaction,
      `https://testnet.allo.info/tx/test`,
    ],
    [
      `test`,
      ChainType.TestNet,
      AlloExplorerUrlType.Address,
      `https://testnet.allo.info/address/test`,
    ],
    [
      `test`,
      ChainType.TestNet,
      AlloExplorerUrlType.Asset,
      `https://testnet.allo.info/asset/test`,
    ],
    [
      `test`,
      ChainType.TestNet,
      AlloExplorerUrlType.Transaction,
      `https://testnet.allo.info/tx/test`,
    ],
  ])(
    `creates url for %p %p %p expecting url %p`,
    (
      input: string,
      chainType: ChainType,
      urlType: AlloExplorerUrlType,
      expectedUrl: string,
    ) => {
      expect(createAlgoExplorerUrl(chainType, input, urlType)).toEqual(
        expectedUrl,
      );
    },
  );
});
