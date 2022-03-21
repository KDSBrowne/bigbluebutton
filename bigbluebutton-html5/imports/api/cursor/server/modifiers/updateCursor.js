import Logger from '/imports/startup/server/logger';
import Cursor from '/imports/api/cursor';
import { check } from 'meteor/check';

export default function updateCursor(meetingId, userId, name, x, y) {
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
    },
  };

  try {
    const { insertedId } = Cursor.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Initialized cursor meeting=${meetingId}`);
    } else {
      Logger.debug('Updated cursor ', { meetingId });
    }
  } catch (err) {
    Logger.error(`Upserting cursor to collection: ${err}`);
  }
}
