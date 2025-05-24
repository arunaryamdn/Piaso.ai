import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Login and Sign Up buttons', () => {
  render(<App />);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
});
