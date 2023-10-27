package org.bigbluebutton.core.apps.presentationpod

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
  extends CreateNewPresentationPodPubMsgHdlr
  with CreateDefaultPresentationPod
  with GetAllPresentationPodsReqMsgHdlr
  with SetCurrentPresentationPubMsgHdlr
  with PresentationConversionCompletedSysPubMsgHdlr
  with PresentationConversionRequestReceivedSysMsgHdlr
  with PdfConversionInvalidErrorSysPubMsgHdlr
  with SetCurrentPagePubMsgHdlr
  with SetPresenterInPodReqMsgHdlr
  with RemovePresentationPubMsgHdlr
  with SetPresentationDownloadablePubMsgHdlr
  with PresentationConversionUpdatePubMsgHdlr
  with PresentationPageGeneratedPubMsgHdlr
  with PresentationPageCountErrorPubMsgHdlr
  with PresentationUploadedFileTooLargeErrorPubMsgHdlr
  with PresentationUploadTokenReqMsgHdlr
  with MakePresentationDownloadReqMsgHdlr
  with ResizeAndMovePagePubMsgHdlr
  with SlideResizedPubMsgHdlr
  with SyncGetPresentationPodsMsgHdlr
  with RemovePresentationPodPubMsgHdlr
  with PresentationPageConvertedSysMsgHdlr
  with PresentationPageConversionStartedSysMsgHdlr
  with PresentationConversionEndedSysMsgHdlr
  with PresentationUploadedFileTimeoutErrorPubMsgHdlr
  with PresentationHasInvalidMimeTypeErrorPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
