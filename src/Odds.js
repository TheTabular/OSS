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
  const [bestOddsData, setBestOddsData] = useState({});
  const [expandedGame, setExpandedGame] = useState(null);
  const [selectedBetType, setSelectedBetType] = useState('spreads');
  const [isLoading, setIsLoading] = useState(true);
  const [noGamesMessage, setNoGamesMessage] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const selectedLeague = useMemo(() => ({ id: selectedLeagueId }), [selectedLeagueId]);

  const preloadImages = async (games) => {
    const uniqueTeams = new Set();
    games.forEach((game) => {
      uniqueTeams.add(game.away_team);
      uniqueTeams.add(game.home_team);
    });

    const imagesToLoad = Array.from(uniqueTeams).map((team) => `/${getLeagueFolder()}/${team}.png`);

    await Promise.all(
      imagesToLoad.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      })
    );

    setImagesLoaded(true);
  };

  useEffect(() => {
    const fetchOddsData = async () => {
      setIsLoading(true);
      setNoGamesMessage('');
      setOddsData([]);
      setBestOddsData({});
      setImagesLoaded(false);
  
      console.log(`Fetching odds data for league: ${selectedLeague.id}`);
  
      try {
        const response = await axios.get(`https://api.opensourcesports.xyz/odds?league_id=${selectedLeague.id}`);
        console.log(`Odds data fetched for league: ${selectedLeague.id}`, response.data);
  
        if (response.data.filtered_odds_data && response.data.filtered_odds_data.length === 0) {
          setNoGamesMessage('No games found today');
          setImagesLoaded(true);
        } else if (response.data.filtered_odds_data) {
          setOddsData(response.data.filtered_odds_data);
          setBestOddsData(response.data.best_odds_data || {});
          await preloadImages(response.data.filtered_odds_data);
        } else {
          console.error('Invalid response data:', response.data);
          setNoGamesMessage('Error fetching odds data');
        }
      } catch (error) {
        console.error('Error fetching odds data:', error);
        setNoGamesMessage('Error fetching odds data');
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
    setOddsData([]);
    setBestOddsData({});
    setExpandedGame(null);
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
    <div className="Odds">
      <div className="form-group">
        <label>League</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={selectedLeague.id === '3'}
              onChange={() => handleLeagueChange('3')}
              disabled={isLoading}
            />
            <span>MLB</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague.id === '6'}
              onChange={() => handleLeagueChange('6')}
              disabled={isLoading}
            />
            <span>NHL</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedLeague.id === '7'}
              onChange={() => handleLeagueChange('7')}
              disabled={isLoading}
            />
            <span>NBA</span>
          </label>
        </div>
      </div>
      
      <div className="initial-divider"></div>
      {isLoading || !imagesLoaded ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : noGamesMessage ? (
        <p>{noGamesMessage}</p>
      ) : (
        oddsData.map((game) => {
          const gameKey = `${game.away_team} vs ${game.home_team}`;
          const bestOdds = bestOddsData[gameKey] || {};

          return (
            <div key={game.id}>
              <div
                className={`game-row ${expandedGame === game ? 'expanded' : ''}`}
                onClick={() => toggleExpand(game)}
              >
                <div className="team-info">
                  <img
                    src={game.away_team ? `/${getLeagueFolder()}/${game.away_team}.png` : ''}
                    alt={game.away_team}
                    className="team-logo"
                  />
                  <span className="team-name">{game.away_team}</span>
                </div>
                <div className="game-info">
                  <span className="vs-text">vs</span>
                  <span className="start-time">{formatDateTime(game.commence_time)}</span>
                </div>
                <div className="team-info">
                  <img
                    src={game.home_team ? `/${getLeagueFolder()}/${game.home_team}.png` : ''}
                    alt={game.home_team}
                    className="team-logo"
                  />
                  <span className="team-name">{game.home_team}</span>
                </div>
              </div>
              {expandedGame === game && (
                <div className="details">
                  <div className="button-group">
                    <button
                      className={selectedBetType === 'spreads' ? 'active' : ''}
                      onClick={() => handleBetTypeChange('spreads')}
                    >
                      Spread
                    </button>
                    <button
                      className={selectedBetType === 'h2h' ? 'active' : ''}
                      onClick={() => handleBetTypeChange('h2h')}
                    >
                      Moneyline
                    </button>
                    <button
                      className={selectedBetType === 'totals' ? 'active' : ''}
                      onClick={() => handleBetTypeChange('totals')}
                    >
                      Total
                    </button>
                  </div>
                  <div className="table">
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
                        <div key={bookmaker.key} className="bookmaker-row">
                          <div className="bookmaker-name">{bookmaker.title}</div>
                          <div className="row">
                            <div className="cell">
                              {selectedBetType === 'spreads' && (
                                <>
                                  {bestOdds.Spread && bestOdds.Spread[game.away_team] && bestOdds.Spread[game.away_team].provider === bookmaker.title && (
                                    <img src="/icons/Crown_left.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {spreadsMarket.outcomes[0].price >= 100 ? '+' : ''}
                                    {spreadsMarket.outcomes[0].price}
                                  </span>
                                </>
                              )}
                              {selectedBetType === 'h2h' && (
                                <>
                                  {bestOdds.Moneyline && bestOdds.Moneyline[game.away_team] && bestOdds.Moneyline[game.away_team].provider === bookmaker.title && (
                                    <img src="/icons/Crown_left.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {h2hMarket.outcomes[0].price >= 100 ? '+' : ''}
                                    {h2hMarket.outcomes[0].price}
                                  </span>
                                </>
                              )}
                              {selectedBetType === 'totals' && (
                                <>
                                  {bestOdds.Total && bestOdds.Total['Over'] && bestOdds.Total['Over'].provider === bookmaker.title && (
                                    <img src="/icons/Crown_left.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {totalsMarket.outcomes[0].price >= 100 ? '+' : ''}
                                    {totalsMarket.outcomes[0].price}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="line-container">
                              <div className="line-cell">
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
                              <div className="line-cell">
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
                            <div className="cell">
                              {selectedBetType === 'spreads' && (
                                <>
                                  {bestOdds.Spread && bestOdds.Spread[game.home_team] && bestOdds.Spread[game.home_team].provider === bookmaker.title && (
                                    <img src="/icons/Crown_right.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {spreadsMarket.outcomes[1].price >= 100 ? '+' : ''}
                                    {spreadsMarket.outcomes[1].price}
                                  </span>
                                </>
                              )}
                              {selectedBetType === 'h2h' && (
                                <>
                                  {bestOdds.Moneyline && bestOdds.Moneyline[game.home_team] && bestOdds.Moneyline[game.home_team].provider === bookmaker.title && (
                                    <img src="/icons/Crown_right.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {h2hMarket.outcomes[1].price >= 100 ? '+' : ''}
                                    {h2hMarket.outcomes[1].price}
                                  </span>
                                </>
                              )}
                              {selectedBetType === 'totals' && (
                                <>
                                  {bestOdds.Total && bestOdds.Total['Under'] && bestOdds.Total['Under'].provider === bookmaker.title && (
                                    <img src="/icons/Crown_right.png" alt="Best Odds" />
                                  )}
                                  <span>
                                    {totalsMarket.outcomes[1].price >= 100 ? '+' : ''}
                                    {totalsMarket.outcomes[1].price}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="divider"></div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Odds;