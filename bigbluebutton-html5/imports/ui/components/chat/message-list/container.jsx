import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { convertNumToEasternArabic } from '/imports/ui/components/app/service';
import ChatList from './component';
import ChatService from '../service';

class ChatContainer extends PureComponent {
  render() {
    return (
      <ChatList {...this.props} />
    );
  }
}

export default withTracker(({ chatId }) => {
  const hasUnreadMessages = ChatService.hasUnreadMessages(chatId);
  const scrollPosition = ChatService.getScrollPosition(chatId);
  const lastReadMessageTime = ChatService.lastReadMessageTime(chatId);
  return {
    convertNumToEasternArabic,
    hasUnreadMessages,
    scrollPosition,
    lastReadMessageTime,
    handleScrollUpdate: ChatService.updateScrollPosition,
    handleReadMessage: ChatService.updateUnreadMessage,
  };
})(ChatContainer);
