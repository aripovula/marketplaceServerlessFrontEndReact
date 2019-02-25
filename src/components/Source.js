import React, { Component } from 'react';
import Paginate from './Paginate';

export class Source extends Component {
  render() {
    return (
      <div className="margintop">
        Source code links
        <Paginate/>
      </div>
    )
  }
}

export default Source
