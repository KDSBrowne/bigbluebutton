import { check } from 'meteor/check';
import changeRole from '../modifiers/changeRole';

export default function handleChangeRole(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId, role, changedBy } = payload.body;

  return changeRole(role, true, userId, meetingId, changedBy);
}
