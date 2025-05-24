import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfolioUpload from './PortfolioUpload';
import { MemoryRouter } from 'react-router-dom';

// Mock fetch
beforeEach(() => {
    global.fetch = jest.fn();
});
afterEach(() => {
    jest.resetAllMocks();
});

describe('PortfolioUpload', () => {
    it('renders upload button and hint', () => {
        const { container } = render(
            <MemoryRouter>
                <PortfolioUpload onUploadSuccess={jest.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No file uploaded yet/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Portfolio/i })).toBeInTheDocument();
    });

    it('shows error on upload fail', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
        const { container } = render(
            <MemoryRouter>
                <PortfolioUpload onUploadSuccess={jest.fn()} />
            </MemoryRouter>
        );
        const button = screen.getByRole('button', { name: /Upload Portfolio/i });
        fireEvent.click(button);
        // Simulate file selection
        const file = new File(['bad'], 'bad.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const input = container.querySelector('input[type="file"]');
        fireEvent.change(input!, { target: { files: [file] } });
        await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument());
    });

    it('calls onUploadSuccess on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        const onUploadSuccess = jest.fn();
        const { container } = render(
            <MemoryRouter>
                <PortfolioUpload onUploadSuccess={onUploadSuccess} />
            </MemoryRouter>
        );
        const button = screen.getByRole('button', { name: /Upload Portfolio/i });
        fireEvent.click(button);
        // Simulate file selection
        const file = new File(['good'], 'good.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const input = container.querySelector('input[type="file"]');
        fireEvent.change(input!, { target: { files: [file] } });
        await waitFor(() => expect(screen.getByText(/Upload successful/i)).toBeInTheDocument());
    });
}); 