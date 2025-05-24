import React from 'react';
import { render, screen } from '@testing-library/react';
import { UI_STRINGS } from '../config';
import { MemoryRouter } from 'react-router-dom';
import * as useDashboardDataModule from './useDashboardData';

afterEach(() => jest.resetAllMocks());

describe('Dashboard', () => {
    it('renders empty state if no data', () => {
        jest.spyOn(useDashboardDataModule, 'useDashboardData').mockImplementation(() => ({
            data: null,
            loading: false,
            error: null,
        }));
        // Import Dashboard after setting the mock
        const Dashboard = require('./Dashboard').default;
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(screen.getByText(/Welcome to your Paiso.ai Dashboard!/i)).toBeInTheDocument();
    });

    it('renders summary cards if data is present', () => {
        jest.spyOn(useDashboardDataModule, 'useDashboardData').mockImplementation(() => ({
            data: {
                metrics: {
                    total_investment: 1000,
                    total_value: 2000,
                    total_pl: 100,
                    pl_percent: 10,
                    num_stocks: 5,
                    profit_stocks: 3,
                    loss_stocks: 2,
                    holdings: [
                        { symbol: 'TCS', quantity: 1, avg_price: 100, ltp: 110, value: 110 }
                    ]
                }
            },
            loading: false,
            error: null,
        } as any));
        // Set a valid dummy JWT token to simulate a logged-in user
        const dummyToken = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })),
            'signature'
        ].join('.');
        localStorage.setItem('token', dummyToken);
        // Import Dashboard after setting the mock
        const Dashboard = require('./Dashboard').default;
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(screen.getByText(/Total Value/i)).toBeInTheDocument();
        expect(screen.getByText(/Profit\/?Loss/i)).toBeInTheDocument();
        expect(screen.getByText(/Today's Change/i)).toBeInTheDocument();
        expect(screen.getByText(/Invested Amount/i)).toBeInTheDocument();
        localStorage.removeItem('token');
    });
}); 