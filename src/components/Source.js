import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Paginate from './Paginate';

export class Source extends Component {
  render() {
    return (
      <div className="margintop" style={{ marginLeft: 50 }}>
        <br /><br />
        <h4 className="is-active">Source code - links</h4>

        <p>I am more or less satisfied of how I could setup serverless backend (AppSync) side of the app. I learned how to code complex resolvers including pipeline resolvers.</p>

        <p>However, I am not happy at all of how I could setup Apollo client - there are repetitive parts and the code can be improved a lot.</p>

        <p>Still, I learned a lot about Apollo Client and I am working on improving my knowledge.</p>
        <p>Links to relevant GitHub pages:</p>
        <span className="horIndent"></span>
        - link to &nbsp;
        <a className="addnlightbg notbold cursorpointer"
        target="_blank" href="https://github.com/aripovula/marketplaceServerlessFrontEndReact"
        >front end app ( in React )</a>
        <br/><br/>
        <span className="horIndent"></span>
        - link to &nbsp;
        <a className="addnlightbg notbold cursorpointer"
        target="_blank" href="https://github.com/aripovula/marketplaceServerlessBackEndSAM"
        >Lambda function only</a>

        <br/>

      </div>
    )
  }
}

export default Source
