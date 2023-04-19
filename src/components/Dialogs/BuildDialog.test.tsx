import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuildDialog } from './BuildDialog';
import { Provider } from 'react-redux';
import store from '@/redux/store';

describe(`BuildDialog`, () => {
  const onDepositConfirmed = jest.fn();
  const onDepositCancelled = jest.fn();
  const depositAsset = {
    index: 1,
    cost: 10,
    object: 1,
    builder: `builderAddress`,
    owner: `ownerAddress`,
  };
  const open = true;

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <BuildDialog
          onDepositConfirmed={onDepositConfirmed}
          onDepositCancelled={onDepositCancelled}
          depositAsset={depositAsset}
          open={open}
        />
      </Provider>,
    );

  it(`renders the component and displays the title`, () => {
    const { getByRole } = renderComponent();
    expect(
      getByRole(`heading`, { name: `What do you want to build?` }),
    ).toBeInTheDocument();
  });

  it(`cancels the deposit`, () => {
    const { getByText } = renderComponent();
    fireEvent.click(getByText(`Cancel`));
    expect(onDepositCancelled).toHaveBeenCalled();
  });
});
