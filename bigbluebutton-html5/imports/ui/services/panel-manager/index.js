import { Session } from 'meteor/session';

export function toggleUserList() {
  return Session.equals('isUserListOpen', true)
    ? Session.set('isUserListOpen', false)
    : Session.set('isUserListOpen', true);
}

export function toggleChatPanel(id) {
  const prevId = Session.get('idChatOpen');

  const openChat = () => {
    resetPanelIfOpen('poll', 'breakoutroom');
    Session.set('idChatOpen', id);
    Session.set('isChatOpen', true);
  };

  return prevId === id ? resetPanelIfOpen('chat') : openChat();
}

export function togglePollPanel() {
  if (Session.equals('isPollOpen', true)) {
    return Session.set('isPollOpen', false);
  }

  resetPanelIfOpen('chat', 'breakoutroom');
  Session.set('isUserListOpen', true);
  Session.set('isPollOpen', true);
  Session.set('forcePollOpen', true);
}

export function toggleBreakoutRoomPanel() {
  if (Session.equals('breakoutRoomIsOpen', true)) {
    return Session.set('breakoutRoomIsOpen', false);
  }

  resetPanelIfOpen('chat', 'poll');
  Session.set('breakoutRoomIsOpen', true);
}

export function resetPanelIfOpen(...panels) {
  const closeChat = () => {
    if (Session.equals('isChatOpen', false)) return;
    Session.set('isChatOpen', false);
    Session.set('idChatOpen', '');
  };

  const closePoll = () => {
    if (Session.equals('isPollOpen', false)) return;
    Session.set('isPollOpen', false);
  };

  const closeBreakoutRoom = () => {
    if (Session.equals('breakoutRoomIsOpen', false)) return;
    Session.set('breakoutRoomIsOpen', false);
  };

  panels.forEach((panel) => {
    switch (panel) {
      case 'chat': closeChat(); break;
      case 'poll': closePoll(); break;
      case 'breakoutroom': closeBreakoutRoom(); break;
      default: break;
    }
  });
}

export default {
  resetPanelIfOpen,
  toggleBreakoutRoomPanel,
  togglePollPanel,
  toggleChatPanel,
};
