import React, {useState} from 'react';
import { NavLink } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import AppRouter, { history } from './AppRouter';



export const Header = (props) => {
    
    const [is2showUserName, setIs2showUserName] = useState(false);
        
    const signOut = (receivedProps) => {
        Auth.signOut()
            .then(data => { console.log(data); receivedProps.checkLoginStatus('Header'); history.push('/login');})
            .catch(err => console.log(err))
    };

    return (

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
                    to="/search"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                    exact={true}
                >Search
                </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="/source"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                >Link to source
                </NavLink>

                <span className="horIndent"></span>|<span className="horIndent"></span>

                <NavLink
                    to="#"
                    onClick={() => signOut(props)}
                    style={{ color: 'white', textDecoration: 'none', fontSize: '14px', float: 'right' }}
                    activeStyle={{ color: 'lightgreen', textDecoration: 'none' }}
                >Logout
                </NavLink>
                <span className="smalltext cursorpointer"
                    onClick={() => {
                        setTimeout(() => setIs2showUserName(false), 30000)
                        setIs2showUserName(!is2showUserName);
                        // alert(`You can check how this app works by loggin in from another browser/computer using username of ${props.username}`); 
                    }}>
                        {!is2showUserName && '(show userName)'}
                        {is2showUserName && `hide - ${props.username}`}

                </span>

            </div>
        </div>
    </header>
    )
}
