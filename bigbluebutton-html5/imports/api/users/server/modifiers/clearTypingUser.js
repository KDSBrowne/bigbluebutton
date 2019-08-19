import Logger from '/imports/startup/server/logger';
import { UsersTyping } from '/imports/api/group-chat-msg';

const clearTypingUser = (meetingId, userId) => {
  if (meetingId && userId) {
    return UsersTyping.remove({ meetingId, userId }, () => {
      Logger.info(`Removed typing User={${userId}} from meetingId={${meetingId}}`);
    });
  }
};

export default clearTypingUser;
