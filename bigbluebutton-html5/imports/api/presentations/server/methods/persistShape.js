import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import Shapes from '/imports/api/shapes';

// function addAnnotation(meetingId, shape) {
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//     console.log('$$$$$$$$$$$$  addAnnotation  $$$$$$$$$$$$$$')
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//     console.log(shape.id)
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//   try {
//     const { insertedId } = Shapes.upsert({ id: shape.id }, { shape });

//     if (insertedId) {
//       Logger.info(`Added shape=${JSON.stringify(shape)} meetingId=${meetingId}`);
//     }
//   } catch (err) {
//     Logger.error(`Adding shape to collection: ${err}`);
//   }
// }

export default function persistShape(shape) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PersistShapePubMsg';

  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  console.log('$$$$$$$$$$$$  PersistShapePubMsg  $$$$$$$$$$$$$$')
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  console.log(JSON.stringify(shape))
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    const payload = {
        meetingId,
        shape,
    };

    // addAnnotation(meetingId, shape);

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method clearWhiteboard ${err.stack}`);
  }
}
