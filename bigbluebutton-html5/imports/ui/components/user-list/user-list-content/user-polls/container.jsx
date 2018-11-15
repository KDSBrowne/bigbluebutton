import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { togglePollPanel } from '/imports/ui/services/panel-manager';
import UserPolls from './component';

const UserPollsContainer = props => <UserPolls {...props} />;

export default withTracker(({ }) => ({
  togglePollMenu: () => togglePollPanel(),
}))(UserPollsContainer);
