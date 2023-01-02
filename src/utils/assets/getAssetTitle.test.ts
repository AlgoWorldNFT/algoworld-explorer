import * as getAssetTitle from '@/utils/assets/getAssetTitle';
import * as Chain from '@/models/Chain';
// @ponicode
describe(`getAssetTitle.default`, () => {
  test(`0`, async () => {
    await getAssetTitle.default(0, Chain.ChainType.MainNet);
  });
});
