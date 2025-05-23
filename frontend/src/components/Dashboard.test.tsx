import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { UI_STRINGS } from '../config';

jest.mock('../services/dashboard', () => ({
    useDashboardData: () => ({
        data: null,
        loading: false,
        error: null,
    }),
}));

describe('Dashboard', () => {
    it('renders empty state if no data', () => {
        render(<Dashboard />);
        expect(screen.getByText(UI_STRINGS.DASHBOARD.EMPTY_STATE)).toBeInTheDocument();
    });

    it('renders summary cards if data is present', () => {
        jest.mock('../services/dashboard', () => ({
            useDashboardData: () => ({
                data: {
                    total_value: 1000,
                    profit_loss: 100,
                    today_change: 10,
                    invested_amount: 900,
                },
                loading: false,
                error: null,
            }),
        }));
        render(<Dashboard />);
        expect(screen.getByText(UI_STRINGS.DASHBOARD.TOTAL_VALUE)).toBeInTheDocument();
        expect(screen.getByText(UI_STRINGS.DASHBOARD.PROFIT_LOSS)).toBeInTheDocument();
        expect(screen.getByText(UI_STRINGS.DASHBOARD.TODAY_CHANGE)).toBeInTheDocument();
        expect(screen.getByText(UI_STRINGS.DASHBOARD.INVESTED_AMOUNT)).toBeInTheDocument();
    });
}); 