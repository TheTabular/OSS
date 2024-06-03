import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Odds.css';

const Odds = () => {
  const [selectedLeague, setSelectedLeague] = useState('3');
  const [oddsData, setOddsData] = useState([]);
  const [expandedGame, setExpandedGame] = useState(null);
  const [selectedBetType, setSelectedBetType] = useState('spreads');
  const [isLoading, setIsLoading] = useState(true);
  const [noGamesMessage, setNoGamesMessage] = useState('');

  const fetchOddsData = useCallback(async () => {
    setIsLoading(true);
    setNoGamesMessage('');
    setOddsData([]);

    try {
      const response = await axios.get(`https://api.opensourcesports.xyz/odds?league_id=${selectedLeague}`);
      if (response.data.length === 0) {
        setNoGamesMessage('No games found today');
      } else {
        setOddsData(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching odds data:', error);
      setIsLoading(false);
    }
  }, [selectedLeague]);

  useEffect(() => {
    fetchOddsData();
  }, [fetchOddsData]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      return '';
    }

    try {
      const dateTime = new Date(dateTimeString);
      const options = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      };
      return dateTime.toLocaleString('en-US', options);
    } catch (error) {
      console.error('Invalid date:', dateTimeString);
      return '';
    }
  };

  const toggleExpand = (game) => {
    setExpandedGame(expandedGame === game ? null : game);
  };

  const handleBetTypeChange = (betType) => {
    setSelectedBetType(betType);
  };

  const getLeagueFolder = () => {
    switch (selectedLeague) {
      case '3':
        return 'mlb';
      case '6':
        return 'nhl';
      case '7':
        return 'nba';
      default:
        return 'mlb';
    }
  };

  return (
    <div className="odds-container">
      <div className="odds-form-group">
        <label>League Name</label>
        <div className="odds-checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={selectedLeague === '3'}
              onChange={() => setSelectedLeague('3')}
            />
            <span>MLB</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague === '6'}
              onChange={() => setSelectedLeague('6')}
            />
            <span>NHL</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague === '7'}
              onChange={() => setSelectedLeague('7')}
            />
            <span>NBA</span>
          </label>
        </div>
      </div>
      <div className="odds-initial-divider"></div>
      {isLoading ? (
        <div className="odds-spinner-container">
          <div className="odds-spinner"></div>
        </div>
      ) : noGamesMessage ? (
        <p>{noGamesMessage}</p>
      ) : (
        oddsData.map((game) => (
          <div key={game.id}>
            <div
              className={`odds-game-row ${expandedGame === game ? 'odds-expanded' : ''}`}
              onClick={() => toggleExpand(game)}
            >
              <div className="odds-team-info">
                <img
                  src={game.away_team ? `/${getLeagueFolder()}/${game.away_team}.png` : ''}
                  alt={game.away_team}
                  className="odds-team-logo"
                />
                <span className="odds-team-name">{game.away_team}</span>
              </div>
              <div className="odds-game-info">
                <span className="odds-vs-text">vs</span>
                <span className="odds-start-time">{formatDateTime(game.commence_time)}</span>
              </div>
              <div className="odds-team-info">
                <img
                  src={game.home_team ? `/${getLeagueFolder()}/${game.home_team}.png` : ''}
                  alt={game.home_team}
                  className="odds-team-logo"
                />
                <span className="odds-team-name">{game.home_team}</span>
              </div>
            </div>
            {expandedGame === game && (
              <div className="odds-details">
                <div className="odds-button-group">
                  <button
                    className={selectedBetType === 'spreads' ? 'odds-active' : ''}
                    onClick={() => handleBetTypeChange('spreads')}
                  >
                    Spread
                  </button>
                  <button
                    className={selectedBetType === 'h2h' ? 'odds-active' : ''}
                    onClick={() => handleBetTypeChange('h2h')}
                  >
                    Moneyline
                  </button>
                  <button
                    className={selectedBetType === 'totals' ? 'odds-active' : ''}
                    onClick={() => handleBetTypeChange('totals')}
                  >
                    Total
                  </button>
                </div>
                <div className="odds-table">
                  {game.bookmakers.map((bookmaker) => (
                    <div key={bookmaker.key} className="odds-bookmaker-row">
                      <div className="odds-cell">
                        {selectedBetType === 'spreads' &&
                          bookmaker.markets.find((market) => market.key === 'spreads')?.outcomes[0]?.price}
                        {selectedBetType === 'h2h' &&
                          bookmaker.markets.find((market) => market.key === 'h2h')?.outcomes[0]?.price}
                        {selectedBetType === 'totals' &&
                          bookmaker.markets.find((market) => market.key === 'totals')?.outcomes[0]?.price}
                      </div>
                      <div className="odds-bookmaker-cell">
                        <p className="odds-bookmaker-name">{bookmaker.title}</p>
                        {selectedBetType === 'spreads' && (
                          <p className="odds-bookmaker-line">
                            {bookmaker.markets.find((market) => market.key === 'spreads')?.outcomes[0]?.point}
                          </p>
                        )}
                        {selectedBetType === 'h2h' && <p className="odds-bookmaker-line">Winner</p>}
                        {selectedBetType === 'totals' && (
                          <p className="odds-bookmaker-line">
                            {bookmaker.markets.find((market) => market.key === 'totals')?.outcomes[0]?.point}
                          </p>
                        )}
                      </div>
                      <div className="odds-cell">
                        {selectedBetType === 'spreads' &&
                          bookmaker.markets.find((market) => market.key === 'spreads')?.outcomes[1]?.price}
                        {selectedBetType === 'h2h' &&
                          bookmaker.markets.find((market) => market.key === 'h2h')?.outcomes[1]?.price}
                        {selectedBetType === 'totals' &&
                          bookmaker.markets.find((market) => market.key === 'totals')?.outcomes[1]?.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="odds-divider"></div>
          </div>
        ))
      )}
    </div>
  );
};

export default Odds;