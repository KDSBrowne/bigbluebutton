import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Auth from '/imports/ui/services/auth';
import LiveResult from './component';


const LiveResultContainer = ({ ...props }) => <LiveResult {...props} />;

export default withTracker(({ }) => {
  // always defined
  const currentUser = Users.findOne({ userId: Auth.userID });

  // always undefined
  const currentPoll = Polls.findOne({ meetingId: Auth.meetingID });

  return {
    currentUser,
    currentPoll,
  };
})(LiveResultContainer);
