import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import updateCursor from '../modifiers/updateCursor';

export default function publishCursorUpdate(meetingId, requesterUserId, payload) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendCursorPositionPubMsg';

  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  console.log('publishCursorUpdate', payload)
  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')

  const { userId, name, x, y } = payload;

  updateCursor(meetingId, userId, name, x, y)

  // return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
