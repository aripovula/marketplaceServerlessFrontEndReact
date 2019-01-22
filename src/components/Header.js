import React from 'react';
import { NavLink } from 'react-router-dom';
// import { startLogout } from '../actions/auth';

// export const Header = ({ startLogout }) => (
export const Header = () => (
    <header className="header fixedElement">
        <div>
            <div className="header__content">
                &nbsp; Niche marketplace - supply chain
        <span className="horIndent"></span><span className="horIndent"></span>

                <NavLink
                    to="/multitrader"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                    exact={true}
                >Trade room - multi trader
        </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="/onetrader"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                    exact={true}
                >Trade room - one member
        </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="/dataroom"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                >Data room
        </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="#"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                >Link to source
        </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="#"
                    // onClick={startLogout}
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px', float: 'right' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                >Logout
        </NavLink>


                <span className="horIndent"></span><span className="horIndent"></span>
                {/*<button className="button button--link" onClick={startLogout}>Logout</button>*/}
            </div>
        </div>
    </header>
);

// export default Header;
