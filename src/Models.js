import React, { useState, useEffect } from 'react';
import './Models.css';
import Horses from './Horses';
import MajorLeague from './MajorLeague';

function Models() {
  const getInitialLeague = () => {
    const storedLeague = localStorage.getItem('selectedModelsLeague');
    return storedLeague || '1'; // Default to NFL if no league is stored
  };

  const [selectedLeague, setSelectedLeague] = useState(getInitialLeague());
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/horses/Canterbury.png';
    img.onload = () => {
      setImageLoaded(true);
    };
  }, []);

  const handleLeagueChange = (league) => {
    setSelectedLeague(league);
    localStorage.setItem('selectedModelsLeague', league);
  };

  if (!imageLoaded) {
    return null;
  }

  return (
    <div className="Models">
      <form>
        <div className="form-group">
          <label>League</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === '1'}
                onChange={() => handleLeagueChange('1')}
              />
              <span>NFL</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === '3'}
                onChange={() => handleLeagueChange('3')}
              />
              <span>MLB</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === '6'}
                onChange={() => handleLeagueChange('6')}
              />
              <span>NHL</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === '7'}
                onChange={() => handleLeagueChange('7')}
              />
              <span>NBA</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === 'horses'}
                onChange={() => handleLeagueChange('horses')}
              />
              <span className="horses-label">
                <img src="/horses/Canterbury.png" alt="Horses" />
              </span>
            </label>
          </div>
        </div>
      </form>
      {selectedLeague === 'horses' ? (
        <Horses />
      ) : (
        <MajorLeague selectedLeague={selectedLeague} />
      )}
    </div>
  );
}

export default Models;