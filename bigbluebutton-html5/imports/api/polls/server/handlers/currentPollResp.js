import Polls from '/imports/api/polls';
import Users from '/imports/api/users';
import flat from 'flat';

export default function currentPollResp({ body }, meetingId) {
  const poll = Polls.findOne({ meetingId });


  console.log('$%^$^$^%$^%$^%$^%$%$^%$^%$^%$');
  console.log(body);
  console.log('$%^$^$^%$^%$^%$^%$%$^%$^%$^%$');
  console.log(poll);
  console.log('$%^$^$^%$^%$^%$^%$%$^%$^%$^%$');

  const selector = {
    meetingId,
    userId: body.userId,
  };

  const u = Users.findOne(selector);
  console.log(u);


  const sel = {
    meetingId,
  };

  const modifier = {
    $set: {
      hasPoll: true,
      poll: flat(poll, { safe: true }),
    },
  };


  const cb = (err) => {
    if (err) {
      return console.log(`adding Poll to user: ${err}`);
    }

    return console.log(`Updating user poll (meetingId: ${meetingId}!)`);
  };

  Users.upsert(selector, modifier, cb);

  return poll;
}
