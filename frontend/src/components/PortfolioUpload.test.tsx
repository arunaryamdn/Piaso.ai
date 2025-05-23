import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfolioUpload from './PortfolioUpload';

// Mock fetch
beforeEach(() => {
    global.fetch = jest.fn();
});
afterEach(() => {
    jest.resetAllMocks();
});

describe('PortfolioUpload', () => {
    it('renders upload button and hint', () => {
        render(<PortfolioUpload onUploadSuccess={jest.fn()} />);
        expect(screen.getByText(/Upload Portfolio/i)).toBeInTheDocument();
        expect(screen.getByText(/No file uploaded yet/i)).toBeInTheDocument();
    });

    it('shows error on upload fail', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
        render(<PortfolioUpload onUploadSuccess={jest.fn()} />);
        const button = screen.getByText(/Upload Portfolio/i);
        fireEvent.click(button);
        // Simulate file selection
        const file = new File(['bad'], 'bad.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const input = screen.getByLabelText(/Upload Portfolio/i, { selector: 'input[type="file"]' }) || document.querySelector('input[type="file"]');
        fireEvent.change(input!, { target: { files: [file] } });
        await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument());
    });

    it('calls onUploadSuccess on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        const onUploadSuccess = jest.fn();
        render(<PortfolioUpload onUploadSuccess={onUploadSuccess} />);
        const button = screen.getByText(/Upload Portfolio/i);
        fireEvent.click(button);
        // Simulate file selection
        const file = new File(['good'], 'good.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const input = screen.getByLabelText(/Upload Portfolio/i, { selector: 'input[type="file"]' }) || document.querySelector('input[type="file"]');
        fireEvent.change(input!, { target: { files: [file] } });
        await waitFor(() => expect(onUploadSuccess).toHaveBeenCalled());
    });
}); 