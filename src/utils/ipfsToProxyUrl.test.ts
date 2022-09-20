import { IpfsGateway } from '@/models/Gateway';
import { ipfsToProxyUrl } from '@/utils/ipfsToProxyUrl';

describe(`ipfsToProxyUrl()`, () => {
  it(`converts ipfs url correctly`, () => {
    const url = ipfsToProxyUrl(
      `ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu`,
      IpfsGateway.DWEB_LINK,
    );

    expect(url).toEqual(
      `https://dweb.link/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu`,
    );
  });
});
