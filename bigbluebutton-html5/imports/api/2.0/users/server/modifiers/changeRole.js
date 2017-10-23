import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

const unassignCurrentPresenter = (meetingId, presenterId) => {
  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    presenter: true,
  };

  const modifier = {
    $set: {
      presenter: false,
    },
    $pop: {
      roles: 'presenter',
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Unassigning current presenter from collection: ${err}`);
    }

    return Logger.info(`Unassign current presenter meeting=${meetingId}`);
  };

  return Users.update(selector, modifier, cb);
};

export default function changeRole(payload, meetingId) {
  const { userId, changedBy, role } = payload;

  const selector = {
    meetingId,
    userId,
  };

  let modifier;

  if (role === 'PRESENTER') {
    modifier = {
      $set: {
        presenter: true,
      },
      $push: {
        roles: 'presenter',
      },
    };
  } else {
    modifier = {
      $set: {
        role,
      },
      $push: {
        roles: (role === 'MODERATOR' ? 'moderator' : 'viewer'),
      },
    };
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (role === 'PRESENTER') {
      unassignCurrentPresenter(meetingId, userId);
    }

    if (numChanged) {
      return Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId} changedBy=${changedBy}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
