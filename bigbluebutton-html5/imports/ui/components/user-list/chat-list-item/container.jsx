import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { togglePanel } from '/imports/ui/services/panel-manager';
import ChatListItem from './component';

const ChatListItemContainer = props => <ChatListItem {...props} />;

export default withTracker(() => ({
  togglePanel,
}))(ChatListItemContainer);
