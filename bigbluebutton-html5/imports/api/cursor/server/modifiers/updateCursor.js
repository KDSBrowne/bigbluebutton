import Logger from '/imports/startup/server/logger';
import Captions from '/imports/api/captions';
import { check } from 'meteor/check';

export default function updateCursor(meetingId, userId, name, x, y, presenter, isPositionOutside) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      meetingId,
      userId,
      name,
      x,
      y,
      presenter,
      isPositionOutside
    },
  };

  try {
    const { insertedId } = Captions.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Initialized cursor meeting=${meetingId}`);
    } else {
      Logger.debug('Updated cursor ', { meetingId });
    }
  } catch (err) {
    Logger.error(`Upserting cursor to collection: ${err}`);
  }
}
