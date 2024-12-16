import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ selectedUser, onUserChange }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <table border="0" cellPadding="0" cellSpacing="0" width="100%" style={{ padding: '2px', backgroundColor: '#ff6600' }}>
      <tbody>
        <tr>
          <td style={{ width: '18px', paddingRight: '4px' }}>
            <a href="https://news.ycombinator.com">
              <img src="https://news.ycombinator.com/y18.svg" width="18" style={{ border: '1px white solid', display: 'block' }} alt="logo" />
            </a>
          </td>
          <td style={{ lineHeight: '12pt', height: '10px' }}>
            <span className="pagetop">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/"><b>Hacker News</b></Link>
                <Link to="/newest">new</Link> |
                <Link to="/threads">threads</Link> |
                <Link to="/comments">comments</Link> |
                <Link to="/ask">ask</Link> |
                <Link to="/submit">submit</Link>
                <form style={{ display: 'inline', marginLeft: '10px' }} onSubmit={handleSearchSubmit}>
                  Search: 
                  <input 
                    type="text" 
                    size="17" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                  />
                  <button type="submit">Search</button>
                </form>
              </div>
            </span>
          </td>
          <td style={{ textAlign: 'right', paddingRight: '4px' }}>
            <span className="pagetop">
              <select 
                value={selectedUser} 
                onChange={onUserChange}
                style={{ marginRight: '10px' }}
              >
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
                <option value="user3">User 3</option>
              </select>
              <Link to="/profile">profile</Link>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Header;
