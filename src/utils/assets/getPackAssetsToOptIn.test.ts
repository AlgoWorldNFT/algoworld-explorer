import * as getPackAssetsToOptIn from '@/utils/assets/getPackAssetsToOptIn';
// @ponicode
describe(`getPackAssetsToOptIn.default`, () => {
  test(`0`, () => {
    const param1: any = [
      {
        id: -5.48,
        amount: -1,
        decimals: 31,
        title: `Direct Functionality Orchestrator`,
        url: `www.google.com`,
      },
      {
        id: 1,
        amount: -1,
        decimals: 3,
        title: `Direct Functionality Orchestrator`,
        url: `Www.GooGle.com`,
      },
      {
        id: -100,
        amount: -1,
        decimals: 31,
        title: `International Intranet Coordinator`,
        url: `https://`,
      },
      {
        id: 1,
        amount: 100,
        decimals: 29,
        title: `Direct Functionality Orchestrator`,
        url: `http://base.com`,
      },
      {
        id: 1,
        amount: 100,
        decimals: 15,
        title: `International Intranet Coordinator`,
        url: `ponicode.com`,
      },
    ];
    const param2: any = [
      {
        index: -100,
        creator: `^5.0.0`,
        name: `Anas`,
        imageUrl: `http://placeimg.com/640/480`,
        decimals: 3,
        unitName: `Edmond`,
        amount: 100,
        frozen: false,
        offeringAmount: -1,
        requestingAmount: 0,
      },
      {
        index: 100,
        creator: `^5.0.0`,
        name: `George`,
        imageUrl: `http://placeimg.com/640/480`,
        decimals: 1,
        unitName: `Pierre Edouard`,
        amount: -100,
        frozen: true,
        offeringAmount: -100,
        requestingAmount: -100,
      },
      {
        index: 100,
        creator: `v4.0.0-rc.4`,
        name: `Edmond`,
        imageUrl: `http://placeimg.com/640/480`,
        decimals: 4,
        unitName: `Jean-Philippe`,
        amount: -1,
        frozen: true,
        offeringAmount: -100,
        requestingAmount: -100,
      },
    ];
    const result: any = getPackAssetsToOptIn.default(param1, param2);
    expect(result).toEqual([-5.48, 1, 1, 1]);
  });
});
