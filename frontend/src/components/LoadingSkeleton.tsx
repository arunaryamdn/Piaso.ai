import React from 'react';
import './LoadingSkeleton.css';

type SkeletonType = 'text' | 'circle' | 'rect' | 'card';

interface LoadingSkeletonProps {
    type?: SkeletonType;
    width?: string | number;
    height?: string | number;
    count?: number;
    className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    type = 'text',
    width = '100%',
    height = '1rem',
    count = 1,
    className = '',
}) => {
    const elements = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`skeleton ${type} ${className}`}
            style={{ width, height }}
        />
    ));

    return <>{elements}</>;
};

export default LoadingSkeleton; 