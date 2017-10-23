import { check } from 'meteor/check';
import changeRole from '../modifiers/changeRole';

export default function handlePresenterAssigned({ body }, meetingId) {
  const { presenterId, assignedBy } = body;

  check(presenterId, String);
  check(assignedBy, String);

  const payload = {
    userId: presenterId,
    changedBy: assignedBy,
    role: 'PRESENTER',
  };

  changeRole(payload, meetingId);
}
