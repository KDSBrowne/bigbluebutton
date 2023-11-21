import * as React from "react";
import PropTypes from "prop-types";
import { Tldraw, track, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import SlideCalcUtil, {
  HUNDRED_PERCENT,
  MAX_PERCENT,
} from "/imports/utils/slideCalcUtils";
// eslint-disable-next-line import/no-extraneous-dependencies
import Settings from "/imports/ui/services/settings";
import logger from "/imports/startup/client/logger";
import KEY_CODES from "/imports/utils/keyCodes";
import {
  presentationMenuHeight,
  styleMenuOffset,
  styleMenuOffsetSmall,
} from "/imports/ui/stylesheets/styled-components/general";
import Styled from "./styles";
import {
  findRemoved,
  filterInvalidShapes,
  mapLanguage,
  sendShapeChanges,
  usePrevious,
} from "./utils";
// import { throttle } from "/imports/utils/throttle";
import { isEqual, clone } from "radash";
import { InstancePresenceRecordType } from "@tldraw/tldraw";
import {
  AssetRecordType,
  createShapeId,
  TLAsset,
  TLExternalAssetContent,
  getHashForString,
  DefaultColorStyle,
} from "@tldraw/tldraw";
import { PageRecordType } from "@tldraw/editor";
import { useRef } from "react";
import { debounce, throttle } from "radash";

const SMALL_HEIGHT = 435;
const SMALLEST_DOCK_HEIGHT = 475;
const SMALL_WIDTH = 800;
const SMALLEST_DOCK_WIDTH = 710;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 32;
const MOUNTED_RESIZE_DELAY = 1500;

// Shallow cloning with nested structures
const deepCloneUsingShallow = (obj) => {
  const clonedObj = clone(obj);
  if (obj.props) {
    clonedObj.props = clone(obj.props);
  }
  if (obj.props) {
    clonedObj.meta = clone(obj.meta);
  }
  return clonedObj;
};

// Helper functions
const deleteLocalStorageItemsWithPrefix = (prefix) => {
  const keysToRemove = Object.keys(localStorage).filter((key) =>
    key.startsWith(prefix)
  );
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

// Example of typical LocalStorage entry tldraw creates:
// `{ TLDRAW_USER_DATA_v3: '{"version":2,"user":{"id":"epDk1 ...`
const clearTldrawCache = () => {
  deleteLocalStorageItemsWithPrefix("TLDRAW");
};

const calculateEffectiveZoom = (initViewboxWidth, curViewboxWidth) => {
  // Calculate the effective zoom level based on the change in viewBoxWidth
  const effectiveZoomValue = (initViewboxWidth * 100) / curViewboxWidth;
  return effectiveZoomValue;
};

const determineViewerFitToWidth = (slidePosition) => {
  return (
    slidePosition.viewBoxWidth === slidePosition.width &&
    slidePosition.viewBoxHeight !== slidePosition.height
  );
};

const updateSvgCursor = () => {
  const svgUseElement = document.querySelector(".tl-cursor use");
  if (svgUseElement) {
    svgUseElement.setAttribute("href", "#newCursor");
  }
};

const cleanArrowShapeProps = (shapeProp) => {
  if (!shapeProp) return;

  if (shapeProp.type === "binding") {
    delete shapeProp.x;
    delete shapeProp.y;
  }

  if (shapeProp.type === "point") {
    delete shapeProp.boundShapeId;
    delete shapeProp.normalizedAnchor;
    delete shapeProp.isExact;
  }
};

export default Whiteboard = React.memo(function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    persistShape,
    shapes,
    assets,
    currentUser,
    whiteboardId,
    zoomSlide,
    skipToSlide,
    slidePosition,
    curPageId,
    presentationWidth,
    presentationHeight,
    zoomChanger,
    isMultiUserActive,
    isRTL,
    fitToWidth,
    zoomValue,
    intl,
    svgUri,
    maxStickyNoteLength,
    fontFamily,
    hasShapeAccess,
    presentationAreaHeight,
    presentationAreaWidth,
    maxNumberOfAnnotations,
    notifyShapeNumberExceeded,
    darkTheme,
    setTldrawIsMounting,
    width,
    height,
    tldrawAPI,
    setTldrawAPI,
    whiteboardToolbarAutoHide,
    toggleToolsAnimations,
    isIphone,
    sidebarNavigationWidth,
    animations,
    isToolbarVisible,
    isModerator,
    fullscreenRef,
    fullscreenElementId,
    layoutContextDispatch,
    currentPresentationPage,
    numberOfPages,
    presentationId,
    hasWBAccess,
    bgShape,
    whiteboardWriters,
    publishCursorUpdate,
    otherCursors,
    isShapeOwner,
    ShapeStylesContext,
  } = props;

  clearTldrawCache();

  const isMultiUser = isMultiUserActive;

  if (curPageId === "0" || !curPageId) return null;

  const [tlEditor, setTlEditor] = React.useState(null);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [tldrawZoom, setTldrawZoom] = React.useState(1);
  const [isMounting, setIsMounting] = React.useState(true);
  const [initialViewBoxWidth, setInitialViewBoxWidth] = React.useState(null);

  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevFitToWidth = usePrevious(fitToWidth);
  const prevPageId = usePrevious(curPageId);

  const whiteboardRef = React.useRef(null);
  const zoomValueRef = React.useRef(zoomValue);
  const prevShapesRef = React.useRef(shapes);
  const tlEditorRef = React.useRef(tlEditor);
  const isCanvasPos = React.useRef(false);
  const slideChanged = React.useRef(false);
  const slideNext = React.useRef(null);
  const prevZoomValueRef = React.useRef(zoomValue);
  const cursorXRef = React.useRef(-1);
  const cursorYRef = React.useRef(-1);
  const initialZoomRef = useRef(null);
  const isFirstZoomActionRef = useRef(true);

  const THRESHOLD = 0.1;
  const lastKnownHeight = React.useRef(presentationHeight);
  const lastKnownWidth = React.useRef(presentationWidth);

  // handles mouse events
  React.useEffect(() => {
    const handleMouseLeave = () => {
      setTimeout(() => {
        publishCursorUpdate({
          xPercent: -1,
          yPercent: -1,
          whiteboardId,
        });
      }, 150);
    };

    const MAX_ZOOM = 4;
    const MIN_ZOOM = 0.2;
    const ZOOM_IN_FACTOR = 0.1;
    const ZOOM_OUT_FACTOR = 0.1;

    const handleWheelEvent = (event) => {
      if (!tlEditorRef.current && isPresenter) return;

      const { x: cx, y: cy, z: cz } = tlEditorRef.current.camera;

      if (isFirstZoomActionRef.current) {
        initialZoomRef.current = cz; // Capture the initial z value
        isFirstZoomActionRef.current = false; // Ensure we don't capture again
      }

      let zoom;
      if (event.deltaY < 0) {
        // Zoom in
        zoom = cz + ZOOM_IN_FACTOR;
        if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
      } else {
        // Zoom out
        zoom = cz - ZOOM_OUT_FACTOR;
      }

      // Ensure we don't zoom out beyond the captured initialZoom value
      if (zoom < initialZoomRef.current) {
        zoom = initialZoomRef.current;
      }

      const { x, y } = { x: cursorXRef.current, y: cursorYRef.current };
      const nextCamera = {
        x: cx + (x / zoom - x) - (x / cz - x),
        y: cy + (y / zoom - y) - (y / cz - y),
        z: zoom,
      };

      tlEditorRef.current.setCamera(nextCamera, { duration: 0 });

      event.preventDefault();
      event.stopPropagation();
    };

    const whiteboardElement = whiteboardRef.current;
    if (whiteboardElement) {
      whiteboardElement.addEventListener("mouseleave", handleMouseLeave);
      whiteboardElement.addEventListener("wheel", handleWheelEvent, {
        capture: true,
      });
    }

    return () => {
      if (whiteboardElement) {
        whiteboardElement.removeEventListener("mouseleave", handleMouseLeave);
        whiteboardElement.removeEventListener("wheel", handleWheelEvent);
      }
    };
  }, [whiteboardRef.current, curPageId]);

  const language = React.useMemo(() => {
    return mapLanguage(Settings?.application?.locale?.toLowerCase() || "en");
  }, [Settings?.application?.locale]);

  // update tlEditor ref
  React.useEffect(() => {
    tlEditorRef.current = tlEditor;
  }, [tlEditor]);

  // presenter effect to handle zoomSlide
  React.useEffect(() => {
    zoomValueRef.current = zoomValue;

    if (tlEditor && curPageId && slidePosition && isPresenter) {
      const zoomFitSlide = calculateZoom(
        slidePosition.width,
        slidePosition.height
      );
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;

      // Compare the current zoom value with the previous one
      if (zoomValue !== prevZoomValueRef.current) {
        setTimeout(() => {
          tlEditor?.setCamera(
            {
              z: zoomCamera,
            },
            false
          );

          let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
            tlEditor?.viewportPageBounds.width,
            slidePosition.width
          );
          let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
            tlEditor?.viewportPageBounds.height,
            slidePosition.height
          );
          zoomSlide(
            parseInt(curPageId, 10),
            viewedRegionW,
            viewedRegionH,
            tlEditor.camera.x,
            tlEditor.camera.y
          );
        }, 50);
      }
    }

    // Update the previous zoom value ref with the current zoom value
    prevZoomValueRef.current = zoomValue;
  }, [zoomValue, tlEditor, curPageId]);

  React.useEffect(() => {
    // Calculate the absolute difference
    const heightDifference = Math.abs(
      presentationHeight - lastKnownHeight.current
    );
    const widthDifference = Math.abs(
      presentationWidth - lastKnownWidth.current
    );

    // Check if the difference is greater than the threshold
    if (heightDifference > THRESHOLD || widthDifference > THRESHOLD) {
      // Update the last known dimensions
      lastKnownHeight.current = presentationHeight;
      lastKnownWidth.current = presentationWidth;

      if (
        presentationHeight > 0 &&
        presentationWidth > 0 &&
        tlEditor &&
        slidePosition &&
        slidePosition.width > 0 &&
        slidePosition.height > 0
      ) {
        let adjustedZoom = HUNDRED_PERCENT;

        if (isPresenter) {
          // Presenter logic
          const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
          const baseZoom = calculateZoom(
            slidePosition.width,
            slidePosition.height
          );

          adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);

          if (fitToWidth && slidePosition) {
            const currentAspectRatio =
              Math.round((presentationWidth / presentationHeight) * 100) / 100;
            const previousAspectRatio =
              Math.round(
                (slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100
              ) / 100;

            if (currentAspectRatio !== previousAspectRatio) {
              tlEditorRef.current?.setCamera(
                {
                  z: adjustedZoom,
                },
                false
              );
            } else {
              tlEditorRef.current?.setCamera(
                {
                  z: adjustedZoom,
                },
                false
              );
            }

            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              tlEditorRef.current?.viewportPageBounds.height,
              slidePosition.height
            );
            setZoom(HUNDRED_PERCENT);
            zoomChanger(HUNDRED_PERCENT);
            zoomSlide(
              parseInt(curPageId, 10),
              HUNDRED_PERCENT,
              viewedRegionH,
              0,
              0
            );
          } else {
            tlEditorRef.current?.setCamera(
              {
                z: adjustedZoom,
              },
              false
            );
          }
        } else {
          // Viewer logic
          const effectiveZoom = calculateEffectiveZoom(
            initialViewBoxWidth,
            slidePosition.viewBoxWidth
          );
          const baseZoom = calculateZoom(
            slidePosition.width,
            slidePosition.height
          );
          adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);

          tlEditorRef.current?.setCamera(
            {
              z: adjustedZoom,
            },
            false
          );
        }

        if (zoomValueRef.current === HUNDRED_PERCENT) {
          initialZoomRef.current = adjustedZoom;
        }
      }
    }
  }, [presentationHeight, presentationWidth, curPageId]);

  React.useEffect(() => {
    if (!fitToWidth && isPresenter) {
      setZoom(HUNDRED_PERCENT);
      zoomChanger(HUNDRED_PERCENT);
      zoomSlide(
        parseInt(curPageId, 10),
        HUNDRED_PERCENT,
        HUNDRED_PERCENT,
        0,
        0
      );
    }
  }, [fitToWidth, isPresenter]);

  React.useEffect(() => {
    if (slidePosition.viewBoxWidth && !initialViewBoxWidth) {
      setInitialViewBoxWidth(slidePosition.viewBoxWidth);
    }

    if (!isPresenter && tlEditorRef.current && initialViewBoxWidth) {
      setTimeout(() => {
        const viewerFitToWidth = determineViewerFitToWidth(slidePosition);

        // Calculate the effective zoom based on the change in viewBoxWidth
        const effectiveZoom = calculateEffectiveZoom(
          initialViewBoxWidth,
          slidePosition.viewBoxWidth
        );

        const zoomFitSlide = calculateViewerZoom(
          slidePosition.width,
          slidePosition.height,
          viewerFitToWidth
        );
        const zoomCamera = (zoomFitSlide * effectiveZoom) / HUNDRED_PERCENT;

        tlEditorRef.current?.setCamera(
          {
            x: slidePosition?.x,
            y: slidePosition?.y,
            z: zoomCamera,
          },
          false
        );
      }, 50);
    }
  }, [
    slidePosition.x,
    slidePosition.y,
    slidePosition.viewBoxWidth,
    slidePosition.viewBoxHeight,
  ]);

  // handles adding shapes to tldraw using it's api's
  React.useEffect(() => {
    if (isEqual(prevShapesRef.current, shapes)) {
      return;
    }

    // Update the ref to store the current value of shapes
    prevShapesRef.current = shapes;

    const localShapes = tlEditor?.store?.allRecords();
    const filteredShapes =
      localShapes?.filter(
        (item) => item.typeName === "shape" && item?.index !== "a0"
      ) || [];
    const localLookup = new Map(
      filteredShapes.map((shape) => [shape.id, shape])
    );
    const remoteShapeIds = Object.keys(shapes);
    const shapesToAdd = [];
    const shapesToUpdate = [];
    const shapesToRemove = [];

    filteredShapes.forEach((localShape) => {
      // If a local shape does not exist in the remote shapes, it should be removed
      if (!remoteShapeIds.includes(localShape.id)) {
        shapesToRemove.push(localShape);
      }
    });

    Object.values(shapes).forEach((remoteShape) => {
      const localShape = localLookup.get(remoteShape.id);

      // Create a deep clone of remoteShape and remove the isModerator property
      const comparisonRemoteShape = deepCloneUsingShallow(remoteShape);
      delete comparisonRemoteShape.isModerator;

      if (!localShape) {
        // If the shape does not exist in local, add it to shapesToAdd
        shapesToAdd.push(remoteShape);
      } else if (!isEqual(localShape, comparisonRemoteShape)) {
        // Capture the differences
        const diff = {
          id: remoteShape.id,
          type: remoteShape.type,
          typeName: remoteShape.typeName,
        };

        // Compare each property
        Object.keys(remoteShape).forEach((key) => {
          if (
            key !== "isModerator" &&
            !isEqual(remoteShape[key], localShape[key])
          ) {
            diff[key] = remoteShape[key];
          }
        });

        if (remoteShape.props) {
          Object.keys(remoteShape.props).forEach((key) => {
            if (!isEqual(remoteShape.props[key], localShape.props[key])) {
              diff.props = diff.props || {};
              diff.props[key] = remoteShape.props[key];
            }
          });
        }

        if (diff?.type === "arrow") {
          cleanArrowShapeProps(diff?.props?.end);
          cleanArrowShapeProps(diff?.props?.start);
        }
        shapesToUpdate.push(diff);
      }
    });

    tlEditor?.store?.mergeRemoteChanges(() => {
      // Now, handle the shapesToRemove if needed
      if (shapesToRemove.length > 0) {
        tlEditor?.store?.remove(shapesToRemove.map((shape) => shape.id));
      }
      if (shapesToAdd && shapesToAdd.length) {
        // Remove isModerator property from each shape in shapesToAdd
        shapesToAdd.forEach((shape) => {
          delete shape.isModerator;

          if (shape?.type === "arrow") {
            cleanArrowShapeProps(shape?.props?.end);
            cleanArrowShapeProps(shape?.props?.start);
          }
        });
        tlEditor?.store?.put(shapesToAdd);
      }
      if (shapesToUpdate && shapesToUpdate.length) {
        tlEditor?.updateShapes(shapesToUpdate);
      }
    });
  }, [shapes, curPageId]);

  // Updating presences in tldraw store based on changes in cursors
  React.useEffect(() => {
    if (tlEditorRef.current) {
      const updatedPresences = otherCursors
        .map(({ userId, user, xPercent, yPercent }) => {
          const { presenter, name } = user;
          const id = InstancePresenceRecordType.createId(userId);
          const active = yPercent !== -1 && yPercent !== -1;
          // if cursor is not active remove it from tldraw store
          if (!active) {
            tlEditorRef.current?.store.remove([id]);
            return null;
          }
          const currentPageId = tlEditorRef.current?.currentPageId;

          const cursor = {
            x: xPercent,
            y: yPercent,
            type: "default",
            rotation: 0,
          };
          const color = presenter ? "#FF0000" : "#70DB70";
          const c = {
            ...InstancePresenceRecordType.create({
              id,
              currentPageId,
              userId,
              userName: name,
              cursor,
              color,
            }),
            lastActivityTimestamp: Date.now(),
          };
          return c;
        })
        .filter((cursor) => cursor && cursor.userId !== currentUser?.userId);

      // If there are any updated presences, put them all in the store
      if (updatedPresences.length) {
        tlEditorRef.current?.store.put(updatedPresences);
      }
    }
  }, [otherCursors]);

  // propogate user tldraw cursor position
  React.useEffect(() => {
    publishCursorUpdate({
      xPercent: cursorXRef.current,
      yPercent: cursorYRef.current,
      whiteboardId,
    });
  }, [cursorXRef, cursorYRef]);

  // set current tldraw page when presentation id updates
  React.useEffect(() => {
    if (tlEditor && curPageId !== "0") {
      // Check if the page exists
      const pageExists =
        tlEditorRef.current.currentPageId === `page:${curPageId}`;

      // If the page does not exist, create it
      if (!pageExists) {
        tlEditorRef.current.createPage({ id: `page:${curPageId}` });
      }

      // Set the current page
      tlEditor.setCurrentPage(`page:${curPageId}`);

      whiteboardToolbarAutoHide &&
        toggleToolsAnimations(
          "fade-in",
          "fade-out",
          "0s",
          hasWBAccess || isPresenter
        );
      slideChanged.current = false;
      slideNext.current = null;
    }
  }, [curPageId]);

  // need to update the slide position in tldraw (slidePosition)
  React.useEffect(() => {
    if (tlEditor && curPageId) {
      tlEditor?.updateAssets([
        {
          id: `asset:${whiteboardId}`,
          props: {
            w: slidePosition?.width,
            h: slidePosition?.height,
            name: "bg",
            isAnimated: false,
            mimeType: null,
            src: tlEditor.store?.get(`asset:${whiteboardId}`)?.props?.src,
          },
        },
      ]);
    }
  }, [slidePosition?.width, slidePosition?.height]);

  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (whiteboardToolbarAutoHide) {
      toggleToolsAnimations(
        "fade-in",
        "fade-out",
        animations ? "3s" : "0s",
        hasWBAccess || isPresenter
      );
    } else {
      toggleToolsAnimations(
        "fade-out",
        "fade-in",
        animations ? ".3s" : "0s",
        hasWBAccess || isPresenter
      );
    }
  }, [whiteboardToolbarAutoHide]);

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

  const calculateViewerZoom = (localWidth, localHeight, fitToWidthValue) => {
    const calcedZoom = fitToWidthValue
      ? presentationWidth / localWidth
      : Math.min(
          presentationWidth / localWidth,
          presentationHeight / localHeight
        );

    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  React.useEffect(() => {
    setTldrawIsMounting(true);
  }, []);

  React.useEffect(() => {
    if (isMounting) {
      setIsMounting(false);
      /// brings presentation toolbar back
      setTldrawIsMounting(false);
    }
  }, [tlEditor?.camera, presentationWidth, presentationHeight]);

  const shouldKeepShape = (id) => {
    if (
      isPresenter ||
      (isModerator && hasWBAccess) ||
      (hasWBAccess && hasShapeAccess(id))
    ) {
      return true;
    }
    return false;
  };

  const shouldResetShape = (shapeId) => {
    if (
      isPresenter ||
      (isModerator && hasWBAccess) ||
      (hasWBAccess && hasShapeAccess(shapeId))
    ) {
      return false;
    }
    return true;
  };

  const handleTldrawMount = (editor) => {
    setTimeout(() => {
      if (
        presentationHeight > 0 &&
        presentationWidth > 0 &&
        slidePosition &&
        slidePosition.width > 0 &&
        slidePosition.height > 0
      ) {
        let adjustedZoom = HUNDRED_PERCENT;

        if (isPresenter) {
          // Presenter logic
          const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
          const baseZoom = calculateZoom(
            slidePosition.width,
            slidePosition.height
          );

          adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
        } else {
          // Viewer logic
          const effectiveZoom = calculateEffectiveZoom(
            initialViewBoxWidth,
            slidePosition.viewBoxWidth
          );
          const baseZoom = calculateZoom(
            slidePosition.width,
            slidePosition.height
          );
          adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);
        }

        // Update the camera
        editor?.setCamera(
          {
            z: adjustedZoom,
          },
          false
        );
      }
    }, 250);

    setTimeout(() => {
      setIsMounting(false);
      setTldrawIsMounting(false);
    }, 300);

    setTlEditor(editor);

    editor?.user?.updateUserPreferences({ locale: language });

    console.log("EDITOR : ", editor);

    const debouncePersistShape = debounce({ delay: 50 }, persistShape);

    editor.store.listen(
      (entry) => {
        const { changes, source } = entry;
        const { added, updated, removed } = changes;

        Object.values(added).forEach((record) => {
          debouncePersistShape(record, whiteboardId, isModerator);
        });

        Object.values(updated).forEach(([_, record]) => {
          debouncePersistShape(record, whiteboardId, isModerator);
        });

        Object.values(removed).forEach((record) => {
          removeShapes([record.id], whiteboardId);
        });
      },
      { source: "user", scope: "document" }
    );

    editor.store.listen(
      (entry) => {
        const { changes, source } = entry;
        const { updated } = changes;
        const { "pointer:pointer": pointers } = updated;
        if (pointers) {
          const [prevPointer, nextPointer] = pointers;
          cursorXRef.current = nextPointer?.x;
          cursorYRef.current = nextPointer?.y;
          publishCursorUpdate({
            xPercent: cursorXRef.current,
            yPercent: cursorYRef.current,
            whiteboardId,
          });
        }

        const camKey = `camera:page:${curPageId}`;
        const { [camKey]: cameras } = updated;
        if (cameras) {
          const [prevCam, nextCam] = cameras;

          const panned = prevCam.x !== nextCam.x || prevCam.y !== nextCam.y;

          if (panned) {
            let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.viewportPageBounds.width,
              slidePosition.width
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.viewportPageBounds.height,
              slidePosition.height
            );

            zoomSlide(
              parseInt(curPageId, 10),
              viewedRegionW,
              viewedRegionH,
              nextCam.x,
              nextCam.y
            );
          }
        }
      },
      { source: "user" }
    );

    if (editor && curPageId) {
      const pages = [
        {
          meta: {},
          id: `page:${curPageId}`,
          name: `Slide ${curPageId}`,
          index: `a1`,
          typeName: "page",
        },
      ];

      editor.store.mergeRemoteChanges(() => {
        editor.batch(() => {
          editor.store.put(pages);
          editor.deletePage(editor.currentPageId);
          editor.setCurrentPage(`page:${curPageId}`);
          editor.store.put(assets);
          editor.createShapes(bgShape);
          editor.history.clear();
        });
      });

      const remoteShapes = shapes;
      const localShapes = editor.store.allRecords();
      const filteredShapes =
        localShapes.filter((item) => item.typeName === "shape") || [];

      const localShapesObj = {};
      filteredShapes.forEach((shape) => {
        localShapesObj[shape.id] = shape;
      });

      const shapesToAdd = [];
      for (let id in remoteShapes) {
        if (
          !localShapesObj[id] ||
          JSON.stringify(remoteShapes[id]) !==
            JSON.stringify(localShapesObj[id])
        ) {
          shapesToAdd.push(remoteShapes[id]);
        }
      }

      editor.store.mergeRemoteChanges(() => {
        if (shapesToAdd && shapesToAdd.length) {
          shapesToAdd.forEach((shape) => {
            delete shape.isModerator;
          });
          editor.store.put(shapesToAdd);
        }
      });

      editor.store.onBeforeChange = (prev, next, source) => {
        // console.log('Before Change - Prev:', prev, 'Next:', next)
        if (next?.typeName === "instance_page_state") {
          if (!isEqual(prev.selectedShapeIds, next.selectedShapeIds)) {
            // Filter the selectedShapeIds
            next.selectedShapeIds =
              next.selectedShapeIds.filter(shouldKeepShape);
          }
          if (!isEqual(prev.hoveredShapeId, next.hoveredShapeId)) {
            // Check hoveredShapeId
            if (shouldResetShape(next.hoveredShapeId)) {
              next.hoveredShapeId = null;
            }
          }
          return next;
        }

        const camera = editor?.camera;
        const panned =
          next?.id?.includes("camera") &&
          (prev.x !== next.x || prev.y !== next.y);
        const zoomed = next?.id?.includes("camera") && prev.z !== next.z;
        if (panned && isPresenter) {
          // // limit bounds
          if (editor?.viewportPageBounds?.maxX > slidePosition?.width) {
            next.x += editor.viewportPageBounds.maxX - slidePosition.width;
          }
          if (editor?.viewportPageBounds?.maxY > slidePosition?.height) {
            next.y += editor.viewportPageBounds.maxY - slidePosition.height;
          }
          if (next.x > 0 || editor.viewportPageBounds.minX < 0) {
            next.x = 0;
          }
          if (next.y > 0 || editor.viewportPageBounds.minY < 0) {
            next.y = 0;
          }
        }
        return next;
      };
    }
  };

  const handleMouseUp = () => {
    !isPresenter &&
      !hasWBAccess &&
      tlEditor?.updateInstanceState({ isReadonly: false });
  };
  const handleMouseDown = () => {
    !isPresenter &&
      !hasWBAccess &&
      tlEditor?.updateInstanceState({ isReadonly: true });
  };

  const handleMouseEnter = () => {
    whiteboardToolbarAutoHide &&
      toggleToolsAnimations(
        "fade-out",
        "fade-in",
        animations ? ".3s" : "0s",
        hasWBAccess || isPresenter
      );
  };

  const handleMouseLeave = () => {
    whiteboardToolbarAutoHide &&
      toggleToolsAnimations(
        "fade-in",
        "fade-out",
        animations ? "3s" : "0s",
        hasWBAccess || isPresenter
      );
  };

  const editableWB = (
    <Tldraw key={`editableWB-${curPageId}`} forceMobile onMount={handleTldrawMount} />
  );

  const readOnlyWB = (
    <Tldraw key={`readOnlyWB-${curPageId}`} forceMobile hideUi onMount={handleTldrawMount} />
  );

  return (
    <div
      ref={whiteboardRef}
      id={"whiteboard-element"}
      key={`animations=-${animations}-${hasWBAccess}-${isPresenter}-${isModerator}-${whiteboardToolbarAutoHide}-${language}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
    >
      {hasWBAccess || isPresenter ? editableWB : readOnlyWB}
      <Styled.TldrawV2GlobalStyle
        {...{ hasWBAccess, isPresenter, isRTL, isMultiUser }}
      />
    </div>
  );
});

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
  whiteboardId: PropTypes.string,
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
  zoomChanger: PropTypes.func.isRequired,
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
  setTldrawIsMounting: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
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
  presentationId: PropTypes.string,
};

Whiteboard.defaultProps = {
  fullscreenRef: undefined,
  slidePosition: undefined,
  svgUri: undefined,
  whiteboardId: undefined,
  sidebarNavigationWidth: 0,
  presentationId: undefined,
};
