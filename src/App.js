import React, { useState } from 'react';
import './App.css';
import stateMapping from './stateMapping';
import providerMapping from './providerMapping';
import timezoneMapping from './timezoneMapping';
import moment from 'moment-timezone';

function App() {
  const [modelType, setModelType] = useState('nn');
  const [oddsProvider, setOddsProvider] = useState('bettoredge');
  const [selectedState, setSelectedState] = useState('');
  const [isStateSelected, setIsStateSelected] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setIsStateSelected(state !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      model_type: modelType,
      odds_provider: oddsProvider,
      state: selectedState,
    };

    console.log("Sending data:", data);

    try {
      const response = await fetch('https://api.opensourcessports.xyz/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResults(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const hasResults = Object.keys(results).length > 0;

  const allOddsProviders = [
    'bettoredge',
    'betmgm',
    'betonlineag',
    'betrivers',
    'betus',
    'bovada',
    'draftkings',
    'fanduel',
    'lowvig',
    'mybookieag',
    'pointsbetus',
    'superbook',
    'unibet_us',
    'williamhill_us',
    'wynnbet',
  ];

  const filteredOddsProviders = selectedState
    ? stateMapping[selectedState] || []
    : allOddsProviders;

    return (
      <div className="App">
        <h1>Open Source Sports</h1>
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
            <label>Odds Provider</label>
            <div className="form-group">
            <select
              value={selectedState}
              onChange={handleStateChange}
              className={isStateSelected ? 'selected' : ''}
            >
              <option value="">Select a state</option>
              {Object.keys(stateMapping).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            </div>
            <div className="checkbox-group">
              {filteredOddsProviders.map((provider) => (
                <label key={provider}>
                  <input
                    type="checkbox"
                    checked={oddsProvider === provider}
                    onChange={() => setOddsProvider(provider)}
                  />
                  <span>{providerMapping[provider]}</span>
                </label>
              ))}
            </div>
          </div>
    
          <button type="submit" disabled={isLoading}>
            Run Model
          </button>
          {isLoading && <div className="spinner"></div>}
        </form>
    
        {hasResults && (
          <div className="results-section">
            <h2>Match Predictions</h2>
            <div className="column-headers">
              <p>Away</p>
              <p>Total</p>
              <p>Home</p>
            </div>
            {Object.entries(results).map(([key, match]) => (
              <div key={key} className="match-prediction">
                <div className="team-prediction">
                  <div className="team-header">
                    <img src={`/nba/${match.away_team}.png`} alt={match.away_team} />
                    <p>{match.away_team}</p>
                  </div>
                  <p><span>Moneyline Odds:</span> {match.away_odds > 0 ? `+${match.away_odds}` : match.away_odds}</p>
                  <p><span>Win Percentage:</span> {match.away_win_percent}%</p>
                  <p>
                    <span>Expected Value:</span>{' '}
                    <span className={match.away_ev > 0 ? 'positive-ev' : 'negative-ev'}>
                      {match.away_ev}
                    </span>
                  </p>
                </div>

                <div className="total-predictions">
                  <div className="commence-time">
                    {moment(match.commence_time)
                      .tz(timezoneMapping[selectedState] || 'America/New_York')
                      .format('MMM D, h:mm A z')}
                  </div>
                  <div className="total-value">{match.total_amount}</div>
                  <div className="over-under">
                    <p>
                      <span>Over:</span>{' '}
                      <span
                        className={
                          match.over_win_percent === 50 && match.under_win_percent === 50
                            ? ''
                            : match.over_win_percent > match.under_win_percent
                            ? 'positive-ev'
                            : 'negative-ev'
                        }
                      >
                        {match.over_win_percent}%
                      </span>
                    </p>
                    <p>
                      <span>Under:</span>{' '}
                      <span
                        className={
                          match.over_win_percent === 50 && match.under_win_percent === 50
                            ? ''
                            : match.under_win_percent > match.over_win_percent
                            ? 'positive-ev'
                            : 'negative-ev'
                        }
                      >
                        {match.under_win_percent}%
                      </span>
                    </p>
                  </div>
                </div>

                <div className="team-prediction">
                  <div className="team-header">
                    <img src={`/nba/${match.home_team}.png`} alt={match.home_team} />
                    <p>{match.home_team}</p>
                  </div>
                  <p><span>Moneyline Odds:</span> {match.home_odds > 0 ? `+${match.home_odds}` : match.home_odds}</p>
                  <p><span>Win Percentage:</span> {match.home_win_percent}%</p>
                  <p>
                    <span>Expected Value:</span>{' '}
                    <span className={match.home_ev > 0 ? 'positive-ev' : 'negative-ev'}>
                      {match.home_ev}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
}

export default App;