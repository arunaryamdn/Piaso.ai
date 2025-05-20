import React from 'react';
import { useNews } from './useNews';

const News: React.FC = () => {
  const { data, loading, error } = useNews();

  if (loading) return <div>Loading news...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Market News</h2>
      {Object.keys(data).length === 0 && <div>No news available.</div>}
      {Object.entries(data).map(([ticker, articles]) => (
        <div key={ticker} style={{ marginBottom: 24 }}>
          <h3>{ticker}</h3>
          {articles.length === 0 && <div>No articles found.</div>}
          {articles.map((article, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <a href={article.link} target="_blank" rel="noopener noreferrer"><b>{article.title}</b></a>
              {article.publisher && <span style={{ marginLeft: 8, color: '#888' }}>{article.publisher}</span>}
              {article.providerPublishTime && <span style={{ marginLeft: 8, color: '#aaa', fontSize: 12 }}>{article.providerPublishTime}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default News;