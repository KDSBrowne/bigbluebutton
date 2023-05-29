import * as React from "react";
import PropTypes from "prop-types";
import SlideCalcUtil, { HUNDRED_PERCENT } from "/imports/utils/slideCalcUtils";
import Cursors from "./cursors/container";
import Settings from "/imports/ui/services/settings";
import logger from "/imports/startup/client/logger";
import KEY_CODES from "/imports/utils/keyCodes";
import {
  presentationMenuHeight,
  styleMenuOffset,
  styleMenuOffsetSmall,
} from "/imports/ui/stylesheets/styled-components/general";
import Styled from "./styles";
import PanToolInjector from "./pan-tool-injector/component";
import {
  findRemoved,
  filterInvalidShapes,
  mapLanguage,
  sendShapeChanges,
  usePrevious,
} from "./utils";
import { throttle } from "/imports/utils/throttle";
import { isEqual } from "radash";

import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/editor.css";
import "@tldraw/tldraw/ui.css";

const SMALL_HEIGHT = 435;
const SMALLEST_HEIGHT = 363;
const SMALL_WIDTH = 800;
const SMALLEST_WIDTH = 645;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 38;

export default function Whiteboard(props) {
  // const language = mapLanguage(
  //   Settings?.application?.locale?.toLowerCase() || "en"
  // );
  // const [currentTool, setCurrentTool] = React.useState(null);
  // const [currentStyle, setCurrentStyle] = React.useState({});
  const [tldrawApi, setTldrawApi] = React.useState(null);

  const {
    curPageId,
    svgUri,
    slidePosition,
    whiteboardId,
    persistShape,
    removeShapes,
    shapes,
    zoomValue,
    isPresenter,
    fitToWidth,
    podId,
    presentationWidth,
    presentationHeight,
    presentationAreaHeight,
    presentationAreaWidth,
    zoomChanger,
    zoomSlide,
  } = props;

  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [tldrawZoom, setTldrawZoom] = React.useState(1);
  const prevFitToWidth = usePrevious(fitToWidth);


  const setDockPosition = (setSetting) => {
    if (hasWBAccess || isPresenter) {
      if (((height < SMALLEST_HEIGHT) || (width < SMALLEST_WIDTH))) {
        setSetting('dockPosition', 'bottom');
      } else {
        setSetting('dockPosition', isRTL ? 'left' : 'right');
      }
    }
  }

  React.useEffect(() => {
    const currentZoom = tldrawApi?.zoomLevel;
    if (currentZoom !== tldrawZoom) {
      setTldrawZoom(currentZoom);
    }
    // setBgShape(null);
  }, [presentationAreaHeight, presentationAreaWidth]);

  // when presentationSizes change, update tldraw camera
  React.useEffect(() => {
    if (
      curPageId &&
      slidePosition &&
      tldrawApi &&
      presentationWidth > 0 &&
      presentationHeight > 0
    ) {
      if (prevFitToWidth !== null && fitToWidth !== prevFitToWidth) {
        const newZoom = calculateZoom(
          slidePosition.width,
          slidePosition.height
        );
        tldrawApi?.setCamera(0, 0, newZoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          tldrawApi?.viewportScreenBounds?.h,
          slidePosition.height
        );
        setZoom(HUNDRED_PERCENT);
        zoomChanger(HUNDRED_PERCENT);
        zoomSlide(
          parseInt(curPageId, 10),
          podId,
          HUNDRED_PERCENT,
          viewedRegionH,
          0,
          0
        );
      } else {
        const currentAspectRatio =
          Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio =
          Math.round(
            (slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100
          ) / 100;
        if (fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // we need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            const newZoom = calculateZoom(
              slidePosition.viewBoxWidth,
              slidePosition.viewBoxHeight
            );
            tldrawApi.setCamera(slidePosition.x, slidePosition.y, newZoom);
          }, 50);
        } else {
          const newZoom = calculateZoom(
            slidePosition.viewBoxWidth,
            slidePosition.viewBoxHeight
          );
          tldrawApi?.setCamera(slidePosition.x, slidePosition.y, newZoom);
        }
      }
    }
  }, [
    presentationWidth,
    presentationHeight,
    curPageId,
    document?.documentElement?.dir,
  ]);

  const calculateZoom = (localWidth, localHeight) => {
    const calcedZoom = fitToWidth
      ? presentationWidth / localWidth
      : Math.min(
          presentationWidth / localWidth,
          presentationHeight / localHeight
        );

    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  // update zoom according to toolbar
  React.useEffect(() => {
    if (
      tldrawApi &&
      isPresenter &&
      curPageId &&
      slidePosition &&
      zoom !== zoomValue
    ) {
      const zoomFitSlide = calculateZoom(
        slidePosition.width,
        slidePosition.height
      );
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;
      setTimeout(() => {
        tldrawApi?.setCamera(0, 0, zoomCamera);
      }, 50);
    }
  }, [zoomValue, tldrawApi]);

  const handleMount = (app) => {
    setTldrawApi(app);

    app.store.mergeRemoteChanges(() => {

   app.createAssets([
      {
        id: "asset:background-image-asset",
        typeName: "asset",
        type: "image",
        props: {
          src: svgUri,
          w: slidePosition?.width || 0,
          h: slidePosition?.height || 0,
          name: "test",
          isAnimated: false,
          mimeType: "image",
        },
      },
    ]);


    app?.store?.put([
      {
        id: app.createShapeId("background-image"),
        x: 0,
        y: 0,
        rotation: 0,
        isLocked: true,
        type: "image",
        props: {
          opacity: "1",
          w: slidePosition?.width || 0,
          h: slidePosition?.height || 0,
          assetId: "asset:background-image-asset",
          playing: true,
          url: svgUri,
        },
      },
    ]);

    // Create a shape
    // app.createShapes([
    //   {
    //     id: app.createShapeId("background-image"),
    //     x: 0,
    //     y: 0,
    //     rotation: 0,
    //     isLocked: true,
    //     type: "image",
    //     props: {
    //       opacity: "1",
    //       w: slidePosition?.width || 0,
    //       h: slidePosition?.height || 0,
    //       assetId: "asset:background-image-asset",
    //       playing: true,
    //       url: svgUri,
    //     },
    //   },
    // ]);


    });

    console.log("app", app.store);

    app.store.onAfterChange = (prev, next) => {
      if (!next?.id?.includes("user_presence")) {
        // console.log("ON AFTER CHANGE - next : ", next);
      }

      if (
        whiteboardId &&
        next?.id?.includes("shape") &&
        !next?.id?.includes("background")
      ) {
        next.wbId = whiteboardId;
        persistShape(next, whiteboardId);
      }
    };

    app.store.onAfterCreate = (record) => {
      console.log("onAfterCreate - record : ", record);
    };

    app.store.onBeforeDelete = (record) => {
      console.log("onBeforeDelete - record : ", record);
      removeShapes([record?.id], whiteboardId);
    };

    // app.createAssets([
    //   {
    //     id: "asset:background-image-asset",
    //     typeName: "asset",
    //     type: "image",
    //     props: {
    //       src: svgUri,
    //       w: slidePosition?.width || 0,
    //       h: slidePosition?.height || 0,
    //       name: "test",
    //       isAnimated: false,
    //       mimeType: "image",
    //     },
    //   },
    // ]);

    // // Create a shape
    // app.createShapes([
    //   {
    //     id: app.createShapeId("background-image"),
    //     x: 0,
    //     y: 0,
    //     rotation: 0,
    //     isLocked: true,
    //     type: "image",
    //     props: {
    //       opacity: "1",
    //       w: slidePosition?.width || 0,
    //       h: slidePosition?.height || 0,
    //       assetId: "asset:background-image-asset",
    //       playing: true,
    //       url: svgUri,
    //     },
    //   },
    // ]);
  };

  React.useEffect(() => {
    if (tldrawApi) {
      console.log("tldrawApi : ", tldrawApi);

      // This is the list of existing shape ids
      let existingShapeIds = tldrawApi.shapeIds;
      // Filter the shapes and track the ones that do exist
      let newShapes = {};
      let existingShapes = {};
      let shapesToDelete = {};
      Object.keys(shapes).forEach((key) => {
        if (existingShapeIds.length > 0 && existingShapeIds?.includes(key)) {
          existingShapes[key] = shapes[key];
        } else {
          newShapes[key] = shapes[key];
        }
      });

      // Find the shapes to delete
      existingShapeIds.forEach((id) => {
        if (!shapes[id]) {
          shapesToDelete[id] = true;
        }
      });

      tldrawApi.store.mergeRemoteChanges(() => {
        const remoteShapeToAdd = Object.values(newShapes);
        // Use the API to create / add new shapes
        tldrawApi.createShapes(remoteShapeToAdd);
        // Use the API to delete the shapes
        tldrawApi?.store?.remove(Object.keys(shapesToDelete));
      });
    }

    console.log('SHAPES', shapes)
  }, [shapes]);

  return (
    <div style={{ height: "100%" }}>
      <Tldraw onMount={handleMount} autoFocus={false} />
    </div>
  );
}

Whiteboard.propTypes = {
  isPresenter: PropTypes.bool.isRequired,
  isIphone: PropTypes.bool.isRequired,
  removeShapes: PropTypes.func.isRequired,
  initDefaultPages: PropTypes.func.isRequired,
  persistShape: PropTypes.func.isRequired,
  notifyNotAllowedChange: PropTypes.func.isRequired,
  shapes: PropTypes.objectOf(PropTypes.shape).isRequired,
  assets: PropTypes.objectOf(PropTypes.shape).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
  curPres: PropTypes.shape({
    pages: PropTypes.arrayOf(PropTypes.shape({})),
    id: PropTypes.string.isRequired,
  }),
  whiteboardId: PropTypes.string,
  podId: PropTypes.string.isRequired,
  zoomSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
  slidePosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    viewBoxWidth: PropTypes.number.isRequired,
    viewBoxHeight: PropTypes.number.isRequired,
  }),
  curPageId: PropTypes.string.isRequired,
  presentationWidth: PropTypes.number.isRequired,
  presentationHeight: PropTypes.number.isRequired,
  isViewersCursorLocked: PropTypes.bool.isRequired,
  zoomChanger: PropTypes.func.isRequired,
  isMultiUserActive: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
  zoomValue: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  svgUri: PropTypes.string,
  maxStickyNoteLength: PropTypes.number.isRequired,
  fontFamily: PropTypes.string.isRequired,
  hasShapeAccess: PropTypes.func.isRequired,
  presentationAreaHeight: PropTypes.number.isRequired,
  presentationAreaWidth: PropTypes.number.isRequired,
  maxNumberOfAnnotations: PropTypes.number.isRequired,
  notifyShapeNumberExceeded: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool.isRequired,
  isPanning: PropTypes.bool.isRequired,
  setTldrawIsMounting: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  hasMultiUserAccess: PropTypes.func.isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  fullscreenAction: PropTypes.string.isRequired,
  fullscreenRef: PropTypes.instanceOf(Element),
  handleToggleFullScreen: PropTypes.func.isRequired,
  nextSlide: PropTypes.func.isRequired,
  numberOfSlides: PropTypes.number.isRequired,
  previousSlide: PropTypes.func.isRequired,
  sidebarNavigationWidth: PropTypes.number,
};

Whiteboard.defaultProps = {
  curPres: undefined,
  fullscreenRef: undefined,
  slidePosition: undefined,
  svgUri: undefined,
  whiteboardId: undefined,
  sidebarNavigationWidth: 0,
};
