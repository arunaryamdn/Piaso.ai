import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioTable from './PortfolioTable';
import { UI_STRINGS } from '../config';

describe('PortfolioTable', () => {
    it('renders no data message if empty', () => {
        render(<PortfolioTable data={[]} />);
        expect(screen.getByText(UI_STRINGS.GENERAL.NO_DATA)).toBeInTheDocument();
    });

    it('renders table rows if data is present', () => {
        const data = [
            { symbol: 'TCS', quantity: 10, avg_price: 100, purchase_date: '2023-01-01' },
            { symbol: 'INFY', quantity: 5, avg_price: 200, purchase_date: '2023-02-01' },
        ];
        render(<PortfolioTable data={data} />);
        expect(screen.getByText('TCS')).toBeInTheDocument();
        expect(screen.getByText('INFY')).toBeInTheDocument();
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // header + rows
    });
}); 