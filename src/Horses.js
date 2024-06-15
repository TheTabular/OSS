import React, { useState } from 'react';
import './Horses.css';

function Horses() {
  const [modelType, setModelType] = useState('nn');
  const [desiredMetric, setDesiredMetric] = useState('Finish Time');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noRacesMessage, setNoRacesMessage] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('Finish Time');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNoRacesMessage('');
    setResults([]);
    setSelectedMetric(desiredMetric);

    const data = {
      model_type: modelType,
      league_id: 'horses',
      desired_metric: desiredMetric,
    };

    console.log("Sending data:", data);

    try {
      const response = await fetch('https://api.opensourcesports.xyz/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResults(result);
      setIsLoading(false);

      if (Object.keys(result).length === 0) {
        setNoRacesMessage('No races found');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const hasModelResults = Object.keys(results).length > 0;

  return (
    <div className="Horses">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Model Type</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={modelType === 'nn'}
                onChange={() => setModelType('nn')}
              />
              <span>Neural Network</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={modelType === 'xgb'}
                onChange={() => setModelType('xgb')}
              />
              <span>XGBoost</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Desired Metric</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={desiredMetric === 'Finish Time'}
                onChange={() => setDesiredMetric('Finish Time')}
              />
              <span>Finish Time</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={desiredMetric === 'Finish Position'}
                onChange={() => setDesiredMetric('Finish Position')}
              />
              <span>Finish Position</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Action Options</label>
          <div className="button-group">
            <button
              type="submit"
              disabled={isLoading}
              className={`${isLoading ? 'disabled' : 'active'}`}
            >
              Run Model
            </button>
          </div>
        </div>
        
        <div className='predictions'>
          {isLoading && <div className="spinner"></div>}
          {!isLoading && noRacesMessage && <p>{noRacesMessage}</p>}
          {hasModelResults && (
            <div className="results-section">
              <h2>Race Predictions</h2>
              {Object.entries(results).map(([key, race]) => (
                <div key={key} className="race-prediction">
                  <h3>{key}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Post No</th>
                        <th>Horse Name</th>
                        <th>{selectedMetric}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {race.map((horse) => (
                        <tr key={horse.post_no}>
                          <td>{horse.post_no}</td>
                          <td>{horse.horse_name}</td>
                          <td className="centered">
                            {selectedMetric === 'Finish Time'
                              ? horse.predicted_time
                              : horse.predicted_position}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Horses;