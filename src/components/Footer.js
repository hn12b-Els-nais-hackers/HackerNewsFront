import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div>
      <img height="10" width="0" alt="" />
      <table width="100%" cellSpacing="0" cellPadding="1">
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#ff6600' }}></td>
          </tr>
        </tbody>
      </table>
      <br />
      <center>
        <span className="yclinks">
          <Link to="/guidelines">Guidelines</Link> |
          <Link to="/faq">FAQ</Link> |
          <Link to="/lists">Lists</Link> |
          <a href="https://github.com/HackerNews/API">API</a> |
          <Link to="/security">Security</Link> |
          <a href="https://www.ycombinator.com/legal/">Legal</a> |
          <a href="https://www.ycombinator.com/apply/">Apply to YC</a> |
          <a href="mailto:hn@ycombinator.com">Contact</a>
        </span>
        <br /><br />
        <form>
          Search: 
          <input type="text" size="17" />
          <button type="submit">Search</button>
        </form>
      </center>
    </div>
  );
}

export default Footer; 