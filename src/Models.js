import React, { useState } from 'react';
import './Models.css';
import Horses from './Horses';
import MajorLeague from './MajorLeague';

function Models() {
  const [selectedLeague, setSelectedLeague] = useState('3');

  return (
    <div className="Models">
      <form>
        <div className="form-group">
          <label>League</label>
          <div className="checkbox-group">
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
            <label>
              <input
                type="checkbox"
                checked={selectedLeague === 'horses'}
                onChange={() => setSelectedLeague('horses')}
              />
              <span className="horses-label">
                <img src="/horses/Canterbury.png" alt="Horses" />
              </span>
            </label>
          </div>
        </div>
      </form>

      {selectedLeague === 'horses' ? <Horses /> : <MajorLeague selectedLeague={selectedLeague} />}
    </div>
  );
}

export default Models;