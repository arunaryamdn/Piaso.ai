import React from 'react';
import { useAIRecommendations } from './useAIRecommendations';

const AIRecommendations: React.FC = () => {
  const { data, loading, error } = useAIRecommendations();

  if (loading) return <div>Loading AI recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>AI Recommendations</h2>
      <table>
        <thead>
          <tr>
            {data[0] && Object.keys(data[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AIRecommendations;