import React from 'react';

function ArchivedData({ archivedData }) {
  return (
    <div className="archived-data-section">
      <h2>Archived Data</h2>
      <table>
        <thead>
          <tr>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Commence Time</th>
            <th>Bookmaker</th>
            <th>Game Info</th>
          </tr>
        </thead>
        <tbody>
          {archivedData.map((data, index) => (
            <tr key={index}>
              <td>{data.home_team}</td>
              <td>{data.away_team}</td>
              <td>{data.commence_time}</td>
              <td>{data.bookmaker}</td>
              <td>
                <pre>{JSON.stringify(data.game_info, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ArchivedData;