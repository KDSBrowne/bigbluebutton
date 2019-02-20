import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setFitToWidth(meetingId, podId, presentationId) {
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
      Logger.error(`Toggle fit to width: ${err}`);
    }
  };

  Logger.info(`Toggled fit to width meetingId=${meetingId} presentationId=${presentationId} podId=${podId}`);

  return Presentations.upsert(selector, modifier, cb);
}
