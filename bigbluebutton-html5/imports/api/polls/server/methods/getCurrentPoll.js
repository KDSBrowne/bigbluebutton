import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function getCurrentPoll(credentials) {
  const { meetingId, requesterUserId } = credentials;
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetCurrentPollReqMsg';

  check(meetingId, String);
  check(requesterUserId, String);

  let userId = requesterUserId;

  return RedisPubSub.publishUserMessage(
    CHANNEL,
    EVENT_NAME,
    meetingId,
    userId,
    ({ requesterId: requesterUserId }),
  );
}
