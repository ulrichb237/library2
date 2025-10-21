// Tests pour Customers.jsx (Library-ui)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import Customers from '../src/pages/Customers.jsx';

describe('Customers page', () => {
  test('renders title', () => {
    render(<Customers />);
    expect(screen.getByText('Gestion des clients')).toBeInTheDocument();
  });

  test('form validation shows error', async () => {
    render(<Customers />);
    const input = screen.getByLabelText(/Prénom/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(await screen.findByText(/requis/i)).toBeInTheDocument();
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<Customers />);
    expect(asFragment()).toMatchSnapshot();
  });
});
