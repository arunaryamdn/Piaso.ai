// portfolioMapping.ts
// Utility to map backend portfolio data to the shape expected by PortfolioTable

export interface PortfolioTableRow {
    symbol: string;
    quantity: number;
    avg_price: number;
    purchase_date: string;
}

export function mapPortfolioRow(row: any): PortfolioTableRow {
    return {
        symbol: row.symbol || row.ticker || row['stock symbol'] || row.Stock || '',
        quantity: row.quantity ?? row['quantity available'] ?? row.Quantity ?? 0,
        avg_price: row.avg_price ?? row['average price'] ?? row.Avg_Price ?? 0,
        purchase_date: row.purchase_date || row['date of purchase'] || row.Buy_Date || '',
    };
}

export function mapPortfolioData(data: any[]): PortfolioTableRow[] {
    if (!Array.isArray(data)) return [];
    return data.map(mapPortfolioRow);
} 