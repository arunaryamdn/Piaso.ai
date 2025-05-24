import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
    it('renders Login and Sign Up buttons for unauthenticated users', () => {
        // Clear any tokens to simulate unauthenticated state
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

    it('renders Get Started button for unauthenticated users', () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );
        expect(screen.getAllByRole('button', { name: /Get Started/i }).length).toBeGreaterThan(0);
    });

    it('does not render Login and Sign Up buttons for authenticated users', () => {
        // Set a dummy token to simulate authenticated state
        const dummyToken = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })),
            'signature'
        ].join('.');
        localStorage.setItem('token', dummyToken);
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );
        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Sign Up/i)).not.toBeInTheDocument();
        localStorage.removeItem('token');
    });

    it('renders Get Started button for authenticated users', () => {
        const dummyToken = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })),
            'signature'
        ].join('.');
        localStorage.setItem('token', dummyToken);
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );
        expect(screen.getAllByRole('button', { name: /Get Started/i }).length).toBeGreaterThan(0);
        localStorage.removeItem('token');
    });
}); 