// NewsPage.tsx
// News page wrapper for Paiso.ai. Renders News component.

import React from 'react';
import News from '../components/News';

/**
 * News page wrapper component. Renders News component.
 */
const NewsPage: React.FC = () => {
    console.debug('[NewsPage] Rendered');
    return <News />;
};

export default NewsPage; 