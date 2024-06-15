import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Data.css';

const Data = () => {
  const getInitialLeague = () => {
    const storedLeague = localStorage.getItem('selectedDataLeague');
    return storedLeague || 'NFL';
  };

  const [selectedDataLeague, setSelectedDataLeague] = useState(getInitialLeague());
  const [datasets, setDatasets] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDatasets = async () => {
    const startTime = Date.now();

    setIsLoading(true);
    setNoDataFound(false);
    setDatasets([]);

    try {
      const response = await axios.get(`https://api.opensourcesports.xyz/data?league=${selectedDataLeague}`);
      const { datasets } = response.data;

      if (datasets.length > 0) {
        setDatasets(datasets);
      } else {
        setNoDataFound(true);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setNoDataFound(true);
    }

    const minDuration = 1000;
    const elapsedTime = Date.now() - startTime;
    const remainingTime = minDuration - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDatasets();
  }, [selectedDataLeague]);

  const handleLeagueChange = (league) => {
    if (league === selectedDataLeague) {
      // If the clicked league is the same as the currently selected league, reload the data
      setDatasets([]);
      setNoDataFound(false);
      fetchDatasets();
    } else {
      // If a different league is clicked, update the selected league and fetch new data
      setSelectedDataLeague(league);
      setDatasets([]);
      setNoDataFound(false);
      localStorage.setItem('selectedDataLeague', league);
    }
  };

  return (
    <div className="Data">
      <div className="form-group">
        <label>League</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={selectedDataLeague === 'NFL'}
              onChange={() => handleLeagueChange('NFL')}
              disabled={isLoading}
            />
            <span>NFL</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedDataLeague === 'MLB'}
              onChange={() => handleLeagueChange('MLB')}
              disabled={isLoading}
            />
            <span>MLB</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedDataLeague === 'NHL'}
              onChange={() => handleLeagueChange('NHL')}
              disabled={isLoading}
            />
            <span>NHL</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedDataLeague === 'NBA'}
              onChange={() => handleLeagueChange('NBA')}
              disabled={isLoading}
            />
            <span>NBA</span>
          </label>
        </div>
      </div>
      <div className="files">
        {isLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : noDataFound ? (
          <p>No data found</p>
        ) : (
          <div className="card-container">
            {datasets.map((dataset, index) => (
              <div className="card" key={index}>
                <div className="card-header">
                  <h2 className="league-name">{selectedDataLeague}</h2>
                  <div className="info-icon-container">
                    <img src="/icons/Info.png" alt="Info" className="info-icon" />
                    <div className="tooltip">
                      <pre>{dataset.headers}</pre>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <h2>{dataset.year}</h2>
                  <p>{dataset.title}</p>
                  <div className="download-icon">
                    {dataset.download_links.map((link, i) => (
                      <a href={link} download={`${selectedDataLeague}_${dataset.folder}.csv`} key={i}>
                        <img src="/icons/Download.png" alt="Download" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Data;