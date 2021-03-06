import React, { Component } from 'react';

export class Source extends Component {
  render() {
    return (
      <div className="margintop" style={{ marginLeft: 50, marginRight: 50 }}>
        <br /><br />
        <h4 className="is-active">Source code - links</h4>

        <p>I am more or less satisfied of how I could setup serverless backend (AppSync) side of the app. I learned how to code complex resolvers including pipeline resolvers. For example, see <a className="addnlightbgReg notbold cursorpointer" target="_blank" href="https://stackoverflow.com/a/54205431/6332774">my answer</a>  at stackoverflow.com to question on 'Adding Global Secondary Index to DynamoDB and pagination using GSI sort key' 
          <a className="addnlightbgReg notbold cursorpointer" target="_blank" href="https://stackoverflow.com/a/54205431/6332774"> ( link ).</a>
        </p>

        <p>However, I am not happy at all of how I could setup Apollo client - there are repetitive parts and the code can be improved a lot.</p>

        <p>Paginated list fetches 'orders' and 're-order rules' only for one company, while all orders and all re-order rules list fetches all orders / re-order rules. I know it is a security / un-restricted access issue. I added option with fetching all orders (sorted for our company by the browser) because of unexpected behaviour I experienced with paginated lists in some cases.</p>
        <p>Still, I learned a lot about Apollo Client and I am working on improving my knowledge.</p>
        <p>Certain console.log() are kept on purpose - in case you want to see how it goes.</p>
        <p>Links to relevant GitHub pages:</p>
        <span className="horIndent"></span>
        - link to &nbsp;
        <a className="addnlightbgReg notbold cursorpointer" target="_blank" href="https://github.com/aripovula/marketplaceServerlessFrontEndReact"
        >front end app ( in React )</a>
        <br/><br/>
        <span className="horIndent"></span>
        - link to &nbsp;
        <a className="addnlightbgReg notbold cursorpointer" target="_blank" href="https://github.com/aripovula/marketplaceServerlessFrontEndReact/blob/master/src/graphQL/appSyncSchema2date.graphql"
        >GraphQL schema</a>
        <br /><br />
        <span className="horIndent"></span>
        - link to &nbsp;
        <a className="addnlightbgReg notbold cursorpointer"
          target="_blank" href="https://github.com/aripovula/marketplaceServerlessBackEndSAM/blob/master/functions/mutateFromLambda.js"
        >Lambda function only</a>
        <p>In real life app I would use several Lambda functions instead of this one. I would also use Step functions and SQS (including for blockchain to ensure that block IDs/numbers are unique). Since I have shown in Find-your-match app that I can do that I decided to save time in this app.</p>
        <p>Also because I have shown that I can test React apps using JEST / Enzyme ( see my 'Simulate Accounts' app ) I did not add any testing work in this demo app.</p>

        <br/>

      </div>
    )
  }
}

export default Source
