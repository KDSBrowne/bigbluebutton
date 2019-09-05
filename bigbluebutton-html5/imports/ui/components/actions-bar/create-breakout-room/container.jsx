import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/actions-bar/service';
import { convertNumToEasternArabic } from '/imports/ui/components/app/service';

import CreateBreakoutRoomModal from './component';

export default withTracker(() => ({
  createBreakoutRoom: Service.createBreakoutRoom,
  getBreakouts: Service.getBreakouts,
  getUsersNotAssigned: Service.getUsersNotAssigned,
  sendInvitation: Service.sendInvitation,
  users: Service.users(),
  meetingName: Service.meetingName(),
  convertNumToEasternArabic,
}))(CreateBreakoutRoomModal);
