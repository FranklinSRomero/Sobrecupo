import './Header.css';
import React from 'react';

const Header = () => {
    return (
      <React.Fragment>
        <header>
          <h1>Sobrecupo</h1>
          { window.location.pathname === "/" ? <></> :
            <div className="arrow-back" id="arrow-back-buildings">
              <a href="/">
                <svg className="svg-icon" href="/" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M853.333333 469.333333H334.08l238.293333-238.293333L512 170.666667 170.666667 512l341.333333 341.333333 60.373333-60.373333L334.08 554.666667H853.333333v-85.333334z"/>
                </svg>
              </a>
            </div>
          }
        </header>
      </React.Fragment>
    )
}

export default Header;