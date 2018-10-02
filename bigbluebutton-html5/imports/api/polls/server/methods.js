import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import publishVote from './methods/publishVote';
import publishPoll from './methods/publishPoll';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';
import getCurrentPoll from './methods/getCurrentPoll';

Meteor.methods(mapToAcl(['methods.publishVote', 'methods.startPoll', 'methods.stopPoll', 'methods.publishPoll', 'methods.getCurrentPoll'], {
  publishVote,
  publishPoll,
  startPoll,
  stopPoll,
  getCurrentPoll,
}));
