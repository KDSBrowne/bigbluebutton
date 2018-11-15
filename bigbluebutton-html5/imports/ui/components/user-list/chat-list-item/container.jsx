import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { toggleChatPanel } from '/imports/ui/services/panel-manager';
import ChatListItem from './component';

const ChatListItemContainer = props => <ChatListItem {...props} />;

export default withTracker((props) => {
  const { chat } = props;

  return {
    toggleChatPanel: () => toggleChatPanel(chat.id),
  };
})(ChatListItemContainer);
