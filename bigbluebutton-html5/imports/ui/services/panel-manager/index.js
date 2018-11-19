import { Session } from 'meteor/session';

export function togglePanel(panel, state, id = '') {
  switch (panel) {
    case 'isChatOpen':
      resetPanel('isPollOpen', 'breakoutRoomIsOpen');
      Session.set('idChatOpen', id);
      break;
    case 'breakoutRoomIsOpen':
      resetPanel('isChatOpen', 'isPollOpen');
      break;
    case 'isPollOpen':
      resetPanel('isChatOpen', 'breakoutRoomIsOpen');
      togglePanel('isUserListOpen', true);
      Session.set('forcePollOpen', true);
      break;
    default: break;
  }
  Session.set(panel, state);
}

export function resetPanel(...panels) {
  panels.forEach((panel) => {
    if (Session.equals(panel, false)) return;
    Session.set(panel, false);
  });
}

export default {
  resetPanel,
  togglePanel,
};
