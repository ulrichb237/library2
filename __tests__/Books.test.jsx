// Tests pour Books.jsx (Library-ui)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import Books from '../src/pages/Books.jsx';

describe('Books page', () => {
  test('renders title', () => {
    render(<Books />);
    expect(screen.getByText('Gestion des livres')).toBeInTheDocument();
  });

  test('form validation shows error', async () => {
    render(<Books />);
    const input = screen.getByLabelText(/Titre/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(await screen.findByText(/requis/i)).toBeInTheDocument();
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<Books />);
    expect(asFragment()).toMatchSnapshot();
  });
});
