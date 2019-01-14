import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function toggleWidth(meetingId, podId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  const presentation = Presentations.findOne({ id: presentationId, meetingId });

  const modifier = {
    $set: {
      fitToWidth: !presentation.fitToWidth,
    },
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Toggle presentation width: ${err}`);
    }
  };

  Logger.info(`Toggled presentation width meetingId=${meetingId} presentationId=${presentationId} podId=${podId}`);

  return Presentations.upsert(selector, modifier, cb);
}
