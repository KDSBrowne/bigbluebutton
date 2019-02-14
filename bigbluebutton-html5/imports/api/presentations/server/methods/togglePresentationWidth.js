import { check } from 'meteor/check';
import toggleWidth from '../modifiers/toggleWidth';

export default function togglePresentationWidth(credentials, podId, currentPresentation) {
  const { meetingId } = credentials;
  const { id } = currentPresentation;

  check(meetingId, String);
  check(id, String);
  check(podId, String);

  return toggleWidth(meetingId, podId, id);
}
