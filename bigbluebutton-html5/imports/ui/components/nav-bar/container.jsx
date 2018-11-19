import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { togglePanel } from '/imports/ui/services/panel-manager';
import userListService from '../user-list/service';
import ChatService from '../chat/service';
import Service from './service';
import NavBar from './component';

const PUBLIC_CONFIG = Meteor.settings.public;
const PUBLIC_GROUP_CHAT_ID = PUBLIC_CONFIG.chat.public_group_id;

const NavBarContainer = ({ children, ...props }) => (
  <NavBar {...props}>
    {children}
  </NavBar>
);

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('clientTitle', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  let meetingRecorded;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    meetingRecorded = meetingObject.recordProp;
    document.title = `${CLIENT_TITLE} - ${meetingTitle}`;
  }

  const checkUnreadMessages = () => {
    const users = userListService.getUsers();

    // 1.map every user id
    // 2.filter the user except the current user from the user array
    // 3.add the public chat to the array
    // 4.check current user has unread messages or not.
    return users
      .map(user => user.id)
      .filter(userID => userID !== Auth.userID)
      .concat(PUBLIC_GROUP_CHAT_ID)
      .some(receiverID => ChatService.hasUnreadMessages(receiverID));
  };

  const breakouts = Service.getBreakouts();
  const currentUserId = Auth.userID;

  const isExpanded = Session.get('isUserListOpen');

  return {
    isExpanded,
    breakouts,
    currentUserId,
    meetingId,
    presentationTitle: meetingTitle,
    hasUnreadMessages: checkUnreadMessages(),
    isBreakoutRoom: meetingIsBreakout(),
    beingRecorded: meetingRecorded,
    togglePanel,
  };
})(NavBarContainer);
