import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../src/components/Navbar.jsx';
import { ThemeProvider } from '../src/context/ThemeContext.jsx';

test('Navbar affiche le titre Library2', () => {
  render(
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </ThemeProvider>
  );
  expect(screen.getByText('Library2')).toBeInTheDocument();
});


