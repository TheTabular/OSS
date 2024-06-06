import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Odds.css';

const Odds = () => {
  const getInitialLeague = () => {
    const storedLeague = localStorage.getItem('selectedLeague');
    if (storedLeague) {
      return { id: storedLeague };
    }
    return { id: '3' }; // Default to MLB
  };

  const [selectedLeagueId, setSelectedLeagueId] = useState(getInitialLeague().id);
  const [oddsData, setOddsData] = useState([]);
  const [expandedGame, setExpandedGame] = useState(null);
  const [selectedBetType, setSelectedBetType] = useState('spreads');
  const [isLoading, setIsLoading] = useState(true);
  const [noGamesMessage, setNoGamesMessage] = useState('');

  const selectedLeague = useMemo(() => ({ id: selectedLeagueId }), [selectedLeagueId]);

  useEffect(() => {
    const fetchOddsData = async () => {
      setIsLoading(true);
      setNoGamesMessage('');
      setOddsData([]);

      try {
        const response = await axios.get(`https://api.opensourcesports.xyz/odds?league_id=${selectedLeague.id}`);
        if (response.data.length === 0) {
          setNoGamesMessage('No games found today');
        } else {
          setOddsData(response.data);
        }
      } catch (error) {
        console.error('Error fetching odds data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOddsData();
  }, [selectedLeague.id]);

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

  const handleLeagueChange = (leagueId) => {
    setSelectedLeagueId(leagueId);
    localStorage.setItem('selectedLeague', leagueId);
  };

  const getLeagueFolder = () => {
    switch (selectedLeague.id) {
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
              checked={selectedLeague.id === '3'}
              onChange={() => handleLeagueChange('3')}
            />
            <span>MLB</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague.id === '6'}
              onChange={() => handleLeagueChange('6')}
            />
            <span>NHL</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague.id === '7'}
              onChange={() => handleLeagueChange('7')}
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
                  {game.bookmakers.map((bookmaker) => {
                    const spreadsMarket = bookmaker.markets.find((market) => market.key === 'spreads');
                    const h2hMarket = bookmaker.markets.find((market) => market.key === 'h2h');
                    const totalsMarket = bookmaker.markets.find((market) => market.key === 'totals');

                    // Check if any of the required odds values are missing
                    if (
                      (selectedBetType === 'spreads' && (!spreadsMarket || !spreadsMarket.outcomes[0] || !spreadsMarket.outcomes[1])) ||
                      (selectedBetType === 'h2h' && (!h2hMarket || !h2hMarket.outcomes[0] || !h2hMarket.outcomes[1])) ||
                      (selectedBetType === 'totals' && (!totalsMarket || !totalsMarket.outcomes[0] || !totalsMarket.outcomes[1]))
                    ) {
                      return null; // Skip rendering the bookmaker row if any required odds are missing
                    }

                    return (
                      <div key={bookmaker.key} className="odds-bookmaker-row">
                        <div className="odds-bookmaker-name">{bookmaker.title}</div>
                        <div className="odds-row">
                          <div className="odds-cell">
                            {selectedBetType === 'spreads' && (
                              <span>
                                {spreadsMarket.outcomes[0].price >= 100 ? '+' : ''}
                                {spreadsMarket.outcomes[0].price}
                              </span>
                            )}
                            {selectedBetType === 'h2h' && (
                              <span>
                                {h2hMarket.outcomes[0].price >= 100 ? '+' : ''}
                                {h2hMarket.outcomes[0].price}
                              </span>
                            )}
                            {selectedBetType === 'totals' && (
                              <span>
                                {totalsMarket.outcomes[0].price >= 100 ? '+' : ''}
                                {totalsMarket.outcomes[0].price}
                              </span>
                            )}
                          </div>
                          <div className="odds-line-container">
                            <div className="odds-line-cell">
                              {selectedBetType === 'spreads' && (
                                <span>
                                  {spreadsMarket.outcomes[0].point >= 0 ? '+' : ''}
                                  {spreadsMarket.outcomes[0].point}
                                </span>
                              )}
                              {selectedBetType === 'h2h' && <span>Away</span>}
                              {selectedBetType === 'totals' && (
                                <span>
                                  O {totalsMarket.outcomes[0].point}
                                </span>
                              )}
                            </div>
                            <div className="odds-line-cell">
                              {selectedBetType === 'spreads' && (
                                <span>
                                  {spreadsMarket.outcomes[1].point >= 0 ? '+' : ''}
                                  {spreadsMarket.outcomes[1].point}
                                </span>
                              )}
                              {selectedBetType === 'h2h' && <span>Home</span>}
                              {selectedBetType === 'totals' && (
                                <span>
                                  U {totalsMarket.outcomes[1].point}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="odds-cell">
                            {selectedBetType === 'spreads' && (
                              <span>
                                {spreadsMarket.outcomes[1].price >= 100 ? '+' : ''}
                                {spreadsMarket.outcomes[1].price}
                              </span>
                            )}
                            {selectedBetType === 'h2h' && (
                              <span>
                                {h2hMarket.outcomes[1].price >= 100 ? '+' : ''}
                                {h2hMarket.outcomes[1].price}
                              </span>
                            )}
                            {selectedBetType === 'totals' && (
                              <span>
                                {totalsMarket.outcomes[1].price >= 100 ? '+' : ''}
                                {totalsMarket.outcomes[1].price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
