import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('renders login form', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows error on invalid credentials', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'bad@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
        await waitFor(() => expect(screen.getByText(/Login failed/i)).toBeInTheDocument());
    });

    it('calls fetch on submit', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'abc' }) });
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
        await waitFor(() => expect(fetch).toHaveBeenCalled());
    });
}); 