import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import _ from 'lodash';

class LiveResult extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('did update: liveResults');
  }

  componentDidMount() {
    console.log('did mount: liveResults');
    // this.props.getCurrentPoll();
    const u = this.props.currentUser.poll;
    // console.log(u)
  }

  render() {
    console.log(this.props.currentPoll);

    return (<Button label="Hello" onClick={() => console.log(this.props.currentUser)} />);
  }
}

export default LiveResult;
