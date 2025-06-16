import React, { ErrorInfo, ReactNode } from 'react';
import { UI_STRINGS } from '../config';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary">
                    <div className="error-content">
                        <h3>{UI_STRINGS.GENERAL.ERROR}</h3>
                        <p>{this.state.error?.message || UI_STRINGS.API.UNKNOWN_ERROR}</p>
                        <button
                            onClick={this.handleRetry}
                            className="retry-btn"
                        >
                            Retry
                        </button>
                        <details className="error-details">
                            <summary>Technical Details</summary>
                            <pre>{this.state.error?.stack}</pre>
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Default export for convenience
export default ErrorBoundary; 