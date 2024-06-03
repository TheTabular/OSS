import React from 'react';
import { BrowserRouter as Router, Route, NavLink, Routes } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Models from './Models';
import Odds from './Odds';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Open Source Sports</h1>
          <nav>
            <ul>
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/models"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Models
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/odds"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Odds
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/odds" element={<Odds />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;