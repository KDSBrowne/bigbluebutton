import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import { shareScreen, unshareScreen, isVideoBroadcasting } from '../screenshare/service';
import { togglePanel } from '/imports/ui/services/panel-manager';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withTracker(({ }) => ({
  isUserPresenter: Service.isUserPresenter(),
  isUserModerator: Service.isUserModerator(),
  handleExitVideo: () => VideoService.exitVideo(),
  handleJoinVideo: () => VideoService.joinVideo(),
  handleShareScreen: onFail => shareScreen(onFail),
  handleUnshareScreen: () => unshareScreen(),
  isVideoBroadcasting: isVideoBroadcasting(),
  recordSettingsList: Service.recordSettingsList(),
  toggleRecording: Service.toggleRecording,
  screenSharingCheck: getFromUserSettings('enableScreensharing', Meteor.settings.public.kurento.enableScreensharing),
  enableVideo: getFromUserSettings('enableVideo', Meteor.settings.public.kurento.enableVideo),
  createBreakoutRoom: Service.createBreakoutRoom,
  meetingIsBreakout: Service.meetingIsBreakout(),
  hasBreakoutRoom: Service.hasBreakoutRoom(),
  meetingName: Service.meetingName(),
  togglePanel,
}))(ActionsBarContainer);
