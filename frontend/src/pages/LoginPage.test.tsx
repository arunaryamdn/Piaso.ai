import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

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
        render(<LoginPage />);
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });

    it('shows error on invalid credentials', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
        render(<LoginPage />);
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'bad@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByText(/Sign In/i));
        await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
    });

    it('calls fetch on submit', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'abc' }) });
        render(<LoginPage />);
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText(/Sign In/i));
        await waitFor(() => expect(fetch).toHaveBeenCalled());
    });
}); 