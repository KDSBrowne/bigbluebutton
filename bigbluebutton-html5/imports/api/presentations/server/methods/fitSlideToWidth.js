import { check } from 'meteor/check';
import setFitToWidth from '../modifiers/setFitToWidth';

export default function fitSlideToWidth(credentials, podId, currentPresentation) {
  const { meetingId } = credentials;
  const { id } = currentPresentation;

  check(meetingId, String);
  check(id, String);
  check(podId, String);

  return setFitToWidth(meetingId, podId, id);
}
