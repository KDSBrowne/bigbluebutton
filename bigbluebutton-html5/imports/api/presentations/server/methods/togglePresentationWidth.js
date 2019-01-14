import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import toggleWidth from '../modifiers/toggleWidth';

export default function togglePresentationWidth(credentials, podId, currentPresentation) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'TogglePresentationWidthPubMsg';

  const { meetingId, requesterUserId } = credentials;
  const { id } = currentPresentation;

  check(meetingId, String);
  check(requesterUserId, String);
  check(id, String);
  check(podId, String);

  const payload = {
    presentationId: id,
    podId,
  };

  toggleWidth(meetingId, podId, id);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
