import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changeRole(role, status, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const action = status ? '$push' : '$pop';

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId} changedBy=${changedBy}`);
    }

    return null;
  };

  if (role === 'PRESENTER') {
    const modifier = {
      $set: {
        [role.toLowerCase()]: status,
      },
      [action]: {
        roles: role.toLowerCase(),
      },
    };

    return Users.update(selector, modifier, cb);
  }

  const nonPresenterMod = {
    $set: {
      role,
    },
    $push: {
      roles: (role.toLowerCase()),
    },
  };

  return Users.update(selector, nonPresenterMod, cb);
}
