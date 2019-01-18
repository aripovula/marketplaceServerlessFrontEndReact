import React, { Component } from 'react';
import AppRouter, { history } from './AppRouter';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <AppRouter/>
        </header>
        content
      </div>
    );
  }
}

export default App;
