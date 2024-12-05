import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import {
  AssetRecordType,
} from '@bigbluebutton/tldraw';
import { throttle } from 'radash';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  ANNOTATION_HISTORY_STREAM,
  CURRENT_PAGE_ANNOTATIONS_STREAM,
  CURRENT_PAGE_ANNOTATIONS_QUERY,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
} from './queries';
import {
  initDefaultPages,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
} from './service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import {
  layoutSelect,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Whiteboard from './component';

import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  PRESENTATION_SET_ZOOM,
  PRES_ANNOTATION_DELETE,
  PRES_ANNOTATION_SUBMIT,
  PRESENTATION_SET_PAGE,
  PRESENTATION_PUBLISH_CURSOR,
  PRESENTATION_SET_PAGE_SELECTED_USER,
  PRESENTATION_SET_PAGE_USER_SHARED_WITH_ALL
} from '../presentation/mutations';
import { useMergedCursorData } from './hooks.ts';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import MediaService from '/imports/ui/components/media/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { debounce } from '/imports/utils/debounce';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const FORCE_RESTORE_PRESENTATION_ON_NEW_EVENTS = 'bbb_force_restore_presentation_on_new_events';

const WhiteboardContainer = (props) => {
  const {
    intl,
    zoomChanger,
  } = props;

  const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
  const layoutContextDispatch = layoutDispatch();

  const [editor, setEditor] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [removedShapes, setRemovedShapes] = useState([]);

  const [currentPresentationPage, setCurrentPresentationPage] = useState(null);

  const { userLocks } = useLockContext();

  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
    userId: user.userId,
  }));
  const isPresenter = currentUser?.presenter;
  const isModerator = currentUser?.isModerator;

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const newPresentationPage = presentationPageArray && presentationPageArray[0];

  useEffect(() => {
    if (newPresentationPage) {
      setCurrentPresentationPage(newPresentationPage);
    }
  }, [newPresentationPage]);

  const curPageNum = currentPresentationPage?.num;
  const curPageId = currentPresentationPage?.pageId;
  const isInfiniteWhiteboard = currentPresentationPage?.infiniteWhiteboard;
  const isInWhiteboardVision = currentPresentationPage?.whiteboardVision;
  const selectedUser = currentPresentationPage?.selectedUser;
  const userSharedWithAll = currentPresentationPage?.userSharedWithAll;
  const curPageIdRef = useRef();

  React.useEffect(() => {
    curPageIdRef.current = curPageId;
  }, [curPageId]);

  const presentationId = currentPresentationPage?.presentationId;

  const { data: whiteboardWritersData } = useDeduplicatedSubscription(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
    {
      variables: { pageId: curPageId },
      skip: !curPageId,
    },
  );

  const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];
  const hasWBAccess = whiteboardWriters?.some((writer) => writer.userId === Auth.userID);

  const [presentationSetZoom] = useMutation(PRESENTATION_SET_ZOOM);
  const [presentationSetPage] = useMutation(PRESENTATION_SET_PAGE);
  const [presentationSetPageSelectedUser] = useMutation(PRESENTATION_SET_PAGE_SELECTED_USER);
  const [presentationSetPageUserSharedWithAll] = useMutation(PRESENTATION_SET_PAGE_USER_SHARED_WITH_ALL);
  const [presentationDeleteAnnotations] = useMutation(PRES_ANNOTATION_DELETE);
  const [presentationSubmitAnnotations] = useMutation(PRES_ANNOTATION_SUBMIT);
  const [presentationPublishCursor] = useMutation(PRESENTATION_PUBLISH_CURSOR);

  const setPresentationPage = (pageId) => {
    presentationSetPage({
      variables: {
        presentationId,
        pageId,
      },
    });
  };

  const setPresentationPageSelectedUser = (selectedUser) => {
    const pageId = `${presentationId}/${curPageNum}`;
    presentationSetPageSelectedUser({
      variables: {
        pageId,
        selectedUser,
      },
    });
  };

  const setPresentationPageUserSharedWithAll = (userSharedWithAll) => {
    const pageId = `${presentationId}/${curPageNum}`;
    console.log('sharing user with all :toakka: ', userSharedWithAll)
    presentationSetPageUserSharedWithAll({
      variables: {
        pageId,
        userSharedWithAll,
      },
    });
  };

  const skipToSlide = (slideNum) => {
    const slideId = `${presentationId}/${slideNum}`;
    setPresentationPage(slideId);
  };

  const removeShapes = (shapeIds) => {
    presentationDeleteAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotationsIds: shapeIds,
      },
    });
  };

  const zoomSlide = debounce((
    widthRatio, heightRatio, xOffset, yOffset, currPage = currentPresentationPage,
  ) => {
    const { pageId, num } = currPage;

    presentationSetZoom({
      variables: {
        presentationId,
        pageId,
        pageNum: num,
        xOffset,
        yOffset,
        widthRatio,
        heightRatio,
      },
    });
  }, 500);

  const submitAnnotations = async (newAnnotations) => {
    const isAnnotationSent = await presentationSubmitAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotations: newAnnotations,
      },
    });

    return isAnnotationSent?.data?.presAnnotationSubmit;
  };

  const persistShapeWrapper = (shape, whiteboardId, amIModerator) => {
    persistShape(shape, whiteboardId, amIModerator, submitAnnotations);
  };

  const publishCursorUpdate = useCallback((payload) => {
    const { whiteboardId, xPercent, yPercent } = payload;

    if (!whiteboardId || !xPercent || !yPercent || !(hasWBAccess || isPresenter)) return;

    presentationPublishCursor({
      variables: {
        whiteboardId,
        xPercent,
        yPercent,
      },
    });
  }, [hasWBAccess, isPresenter]);

  const throttledPublishCursorUpdate = useMemo(() => throttle(
    { interval: WHITEBOARD_CONFIG.cursorInterval },
    publishCursorUpdate,
  ), [publishCursorUpdate]);

  const isMultiUserActive = whiteboardWriters?.length > 0;

  const cursorArray = useMergedCursorData();

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    createdTime: m.createdTime,
  }));

  const { data: initialPageAnnotations, refetch: refetchInitialPageAnnotations } = useQuery(
    CURRENT_PAGE_ANNOTATIONS_QUERY,
    {
      skip: !curPageId,
    },
  );

  const lastUpdatedAt = useMemo(() => {
    return new Date(0).toISOString(); // Start of time
  }, []);
  

  const { data: annotationStreamData } = useSubscription(ANNOTATION_HISTORY_STREAM, {
    variables: { updatedAt: lastUpdatedAt },
    skip: !curPageId || !lastUpdatedAt,
    onSubscriptionData: ({ subscriptionData }) => {
      const annotationStream =
        subscriptionData.data?.pres_annotation_history_curr_stream || [];

      const processedAnnotationIds = new Set();
      const validShapes = [];
      const annotationsToBeRemoved = new Set();

      for (let i = annotationStream.length - 1; i >= 0; i--) {
        const annotation = annotationStream[i];
        const { annotationId, annotationInfo } = annotation;

        if (processedAnnotationIds.has(annotationId)) {
          continue;
        }

        processedAnnotationIds.add(annotationId);

        if (!annotationInfo) {
          annotationsToBeRemoved.add(annotationId);
        } else {
          validShapes.push({ ...annotationInfo, id: annotationId });
        }
      }

      setShapes(() => {
        if (validShapes.length > 0) {
          const restoreOnUpdate = getFromUserSettings(
            FORCE_RESTORE_PRESENTATION_ON_NEW_EVENTS,
            window.meetingClientSettings.public.presentation.restoreOnUpdate
          );

          if (restoreOnUpdate) {
            MediaService.setPresentationIsOpen(layoutContextDispatch, true);
          }
        }

        return validShapes.length > 0 ? validShapes : [];
      });

      setRemovedShapes(Array.from(annotationsToBeRemoved || []));
    },
  });

  React.useEffect(() => {
    if (curPageIdRef.current) {
      refetchInitialPageAnnotations();
    }
  }, [curPageIdRef.current, presentationId, isInWhiteboardVision, selectedUser, userSharedWithAll]);

  const processAnnotations = (data) => {
    let annotationsToBeRemoved = [];
    const newAnnotations = [];
    const updatedAnnotations = [];

    data.forEach((item) => {
      if (!item.annotationInfo) {
        annotationsToBeRemoved.push(item.annotationId);
      } else {
        const annotationInfoParsed = JSON.parse(item.annotationInfo);
        const existingShape = editor?.getShape(item.annotationId);
        if (existingShape) {
          updatedAnnotations.push({
            ...item,
            annotationInfo: annotationInfoParsed,
          });

          annotationsToBeRemoved = annotationsToBeRemoved.filter(
            (id) => id !== item.annotationId
          );
        } else {
          newAnnotations.push({
            ...item,
            annotationInfo: annotationInfoParsed,
          });
        }
      }
    });

    setShapes(() => [
      ...updatedAnnotations.map(({ annotationInfo, annotationId }) => ({
        ...annotationInfo,
        id: annotationId,
      })),
      ...newAnnotations.map(({ annotationInfo, annotationId }) => ({
        ...annotationInfo,
        id: annotationId,
      })),
    ]);

    if (updatedAnnotations.length > 0 || newAnnotations.length > 0) {
      const restoreOnUpdate = getFromUserSettings(
        FORCE_RESTORE_PRESENTATION_ON_NEW_EVENTS,
        window.meetingClientSettings.public.presentation.restoreOnUpdate,
      );

      if (restoreOnUpdate) {
        MediaService.setPresentationIsOpen(layoutContextDispatch, true);
      }
    }

    setRemovedShapes(annotationsToBeRemoved.length > 0 ? annotationsToBeRemoved : []);
  };

  useEffect(() => {
    if (initialPageAnnotations && initialPageAnnotations.pres_annotation_curr) {
      processAnnotations(initialPageAnnotations.pres_annotation_curr);
    }
  }, [initialPageAnnotations]);

  useEffect(() => {
    if (!curPageId || !lastUpdatedAt) {
      setShapes([]);
      setRemovedShapes([]);
    }
  }, [curPageId, lastUpdatedAt]);
  

  const bgShape = [];

  const { isIphone, isPhone } = deviceInfo;

  const assetId = AssetRecordType.createId(curPageNum);
  const assets = [{
    id: assetId,
    typeName: 'asset',
    type: 'image',
    meta: {},
    props: {
      w: currentPresentationPage?.scaledWidth,
      h: currentPresentationPage?.scaledHeight,
      src: currentPresentationPage?.svgUrl,
      name: '',
      isAnimated: false,
      mimeType: null,
    },
  }];

  const Settings = getSettingsSingletonInstance();
  const { isRTL } = Settings.application;
  const width = layoutSelect((i) => i?.output?.presentation?.width);
  const height = layoutSelect((i) => i?.output?.presentation?.height);
  const sidebarNavigationWidth = layoutSelect(
    (i) => i?.output?.sidebarNavigation?.width,
  );
  const { maxStickyNoteLength, maxNumberOfAnnotations } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
  const {
    colorStyle, dashStyle, fillStyle, fontStyle, sizeStyle,
  } = WHITEBOARD_CONFIG.styles;
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);

  // use -0.5 offset to avoid white borders rounding erros
  bgShape.push({
    x: -0.5,
    y: -0.5,
    rotation: 0,
    isLocked: true,
    opacity: 1,
    meta: {},
    id: `shape:BG-${curPageNum}`,
    type: 'image',
    props: {
      w: currentPresentationPage?.scaledWidth + 1.5 || 1,
      h: currentPresentationPage?.scaledHeight + 1.5 || 1,
      assetId,
      playing: true,
      url: '',
      crop: null,
    },
    parentId: `page:${curPageNum}`,
    index: 'a0',
    typeName: 'shape',
  });

  if (!currentPresentationPage) return null;

  return (
    <Whiteboard
      key={presentationId}
      {...{
        isPresenter,
        isModerator,
        currentUser,
        isRTL,
        width,
        height,
        maxStickyNoteLength,
        maxNumberOfAnnotations,
        fontFamily,
        colorStyle,
        dashStyle,
        fillStyle,
        fontStyle,
        sizeStyle,
        handleToggleFullScreen,
        sidebarNavigationWidth,
        layoutContextDispatch,
        initDefaultPages,
        persistShapeWrapper,
        isMultiUserActive,
        shapes,
        removedShapes,
        bgShape,
        assets,
        removeShapes,
        zoomSlide,
        notifyNotAllowedChange,
        notifyShapeNumberExceeded,
        whiteboardToolbarAutoHide: Settings?.application?.whiteboardToolbarAutoHide,
        animations: Settings?.application?.animations,
        toggleToolsAnimations,
        isIphone,
        isPhone,
        isInWhiteboardVision,
        currentPresentationPage,
        numberOfPages: currentPresentationPage?.totalPages,
        presentationId,
        hasWBAccess,
        whiteboardWriters,
        zoomChanger,
        skipToSlide,
        setPresentationPageSelectedUser,
        setPresentationPageUserSharedWithAll,
        locale: Settings?.application?.locale,
        darkTheme: Settings?.application?.darkTheme,
        selectedLayout: Settings?.application?.selectedLayout,
        isInfiniteWhiteboard,
        userSharedWithAll,
        curPageNum,
        setEditor,
      }}
      {...props}
      meetingId={Auth.meetingID}
      publishCursorUpdate={throttledPublishCursorUpdate}
      otherCursors={cursorArray}
      hideViewersCursor={userLocks?.hideViewersCursor}
    />
  );
};

WhiteboardContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  zoomChanger: PropTypes.func.isRequired,
};

export default WhiteboardContainer;
