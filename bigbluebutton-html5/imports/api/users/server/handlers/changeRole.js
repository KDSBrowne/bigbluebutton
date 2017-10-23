import { check } from 'meteor/check';
import changeRole from '../modifiers/changeRole';

export default function handleChangeRole(payload, meetingId) {
  const { userId, changedBy, role } = payload.body;

  check(role, String);
  check(userId, String);
  check(changedBy, String);

  const body = {
    userId,
    changedBy,
    role,
  };

  changeRole(body, meetingId);
}
