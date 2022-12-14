import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AboutDialog from './AboutDialog';

describe(`AboutDialog`, () => {
  it(`renders the correct content and handles the close button correctly`, () => {
    const changeStateMock = jest.fn();
    const { getByText } = render(
      <AboutDialog open={true} changeState={changeStateMock} />,
    );

    // Check that the dialog renders with the correct title and content
    expect(
      getByText(
        `AlgoWorld Explorer is a free and open-source NFT explorer built for AlgoWorld NFT community. Distributed under GPLv3 license.`,
        { exact: false },
      ),
    ).toBeInTheDocument();

    // Check that clicking the close button calls the changeState function with the correct argument
    fireEvent.click(getByText(`Close`));
    expect(changeStateMock).toHaveBeenCalledWith(false);
  });
});
