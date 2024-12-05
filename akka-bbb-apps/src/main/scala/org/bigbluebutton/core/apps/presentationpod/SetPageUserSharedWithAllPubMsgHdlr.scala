package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.db.PresPageDAO

trait SetPageUserSharedWithAllPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
      msg: SetPageUserSharedWithAllPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set id of user to share shapes with all."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      val pageId = msg.body.pageId
      val userSharedWithAll = msg.body.userSharedWithAll

      PresPageDAO.updateUserSharedWithAll(pageId, userSharedWithAll)

      state
    }
  }
}