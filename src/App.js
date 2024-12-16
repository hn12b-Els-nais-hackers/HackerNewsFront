import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './screens/Profile';
import Submit from './screens/Submit';
import Ask from './screens/Ask';
import SearchResults from './screens/SearchResults';
import './App.css';

// Hardcoded API keys for demo
const USERS = {
  user1: { apiKey: '4a2fcf0c-9a63-45dc-911a-c99ea0630de9', username: 'cara63582' },
  user2: { apiKey: 'd8ff9305-ae7a-46d4-a925-2801074f7981', username: 'hnsuporte1' },
  user3: { apiKey: '4422a137-b762-455c-8d02-031458cc832b', username: 'athurte081' },
};

function App() {
  const [selectedUser, setSelectedUser] = useState('user1');

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  return (
    <Router>
      <div className="App">
        <center>
          <table id="hnmain" border="0" cellPadding="0" cellSpacing="0" width="85%" bgcolor="#f6f6ef">
            <tbody>
              <tr>
                <td>
                  <Header selectedUser={selectedUser} onUserChange={handleUserChange} />
                </td>
              </tr>
              <tr>
                <td>
                  <Routes>
                    <Route 
                      path="/profile" 
                      element={<Profile user={USERS[selectedUser]} />} 
                    />
                    <Route 
                      path="/submit" 
                      element={<Submit user={USERS[selectedUser]} />} 
                    />
                    <Route 
                      path="/ask" 
                      element={<Ask user={USERS[selectedUser]} />} 
                    />
                    <Route 
                    path="/search" 
                    element={<SearchResults user={USERS[selectedUser]} />} 
                    />
                  </Routes>
                </td>
              </tr>
              <tr>
                <td>
                  <Footer />
                </td>
              </tr>
            </tbody>
          </table>
        </center>
      </div>
    </Router>
  );
}

export default App;
