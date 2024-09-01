import React from 'react';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const findRemoved = (A, B) => A.filter((a) => !B.includes(a));

const filterInvalidShapes = (shapes, curPageId, tldrawAPI) => {
  const retShapes = shapes;
  const keys = Object.keys(shapes);
  const removedChildren = [];
  const removedParents = [];

  keys.forEach((shape) => {
    if (shapes[shape].parentId !== curPageId) {
      if (!keys.includes(shapes[shape].parentId)) {
        delete retShapes[shape];
      }
    } else if (shapes[shape].type === 'group') {
      const groupChildren = shapes[shape].children;

      groupChildren.forEach((child) => {
        if (!keys.includes(child)) {
          removedChildren.push(child);
        }
      });
      retShapes[shape].children = groupChildren.filter((child) => !removedChildren.includes(child));

      if (shapes[shape].children.length < 2) {
        removedParents.push(shape);
        delete retShapes[shape];
      }
    }
  });
  // remove orphaned children
  Object.keys(shapes).forEach((shape) => {
    if (shapes[shape] && shapes[shape].parentId !== curPageId) {
      if (removedParents.includes(shapes[shape].parentId)) {
        delete retShapes[shape];
      }
    }

    // remove orphaned bindings
    if (shapes[shape] && shapes[shape].type === 'arrow'
      && (shapes[shape].handles.start.bindingId || shapes[shape].handles.end.bindingId)) {
      const startBinding = shapes[shape].handles.start.bindingId;
      const endBinding = shapes[shape].handles.end.bindingId;

      const startBindingData = tldrawAPI?.getBinding(startBinding);
      const endBindingData = tldrawAPI?.getBinding(endBinding);

      if (startBinding && (!startBindingData && (
        removedParents.includes(startBindingData?.fromId)
        || removedParents.includes(startBindingData?.toId)
        || !keys.includes(startBindingData?.fromId)
        || !keys.includes(startBindingData?.toId)
      ))) {
        delete retShapes[shape].handles.start.bindingId;
      }
      if (endBinding && (!endBindingData && (
        removedParents.includes(endBindingData?.fromId)
        || removedParents.includes(endBindingData?.toId)
        || !keys.includes(endBindingData?.fromId)
        || !keys.includes(endBindingData?.toId)
      ))) {
        delete retShapes[shape].handles.end.bindingId;
      }
    }
  });
  return retShapes;
};

const isValidShapeType = (shape) => {
  const invalidTypes = ['image', 'embed'];
  return !invalidTypes.includes(shape?.type);
};

// map different localeCodes from bbb to tldraw
const mapLanguage = (language) => {
  // bbb has xx-xx but in tldraw it's only xx
  if (['es', 'fa', 'it', 'pl', 'sv', 'uk'].some((lang) => language.startsWith(lang))) {
    return language.substring(0, 2);
  }
  // exceptions
  switch (language) {
    case 'nb-no':
      return 'no';
    case 'zh-cn':
      return 'zh-ch';
    default:
      return language;
  }
};

const cursorWorkerCode = `
self.onmessage = function (e) {
  const { otherCursors, whiteboardWriters, currentUser, curPageId, hideViewersCursor, isMultiUserActive, isPresenter, presenceRecord } = e.data;
  let pr = presenceRecord;
  try {
    const idsToRemove = [];
    const updatedPresences = otherCursors
      .map(({ userId, user, xPercent, yPercent }) => {
        const { presenter, name, role } = user;
        const id = 'instance_presence:' + userId;
        const active = xPercent !== -1 && yPercent !== -1;
        // if cursor is not active or is a viewer and should not be shown, remove it from tldraw store
        if (
          !active ||
          (hideViewersCursor && role === "VIEWER" && !presenter) ||
          (!presenter && !isMultiUserActive)
        ) {
          idsToRemove.push(id);
          return null;
        }
        const cursor = {
          x: xPercent,
          y: yPercent,
          type: "default",
          rotation: 0,
        };
        const color = presenter ? "#FF0000" : "#70DB70";
        pr.id = id;
        pr.userId = userId;
        pr.userName = name;
        pr.cursor = cursor;
        pr.color = color;
        pr.lastActivityTimestamp = Date.now()
        const presence = pr
        return presence;
      })
      .filter(cursor => cursor && cursor.userId !== currentUser?.userId);

    // Send the processed data back to the main thread
    self.postMessage({ updatedPresences, idsToRemove });
  } catch (error) {
    self.postMessage({ error: 'Error in cursor worker: ' + error.message });
  }
};
`;

const shapesWorkerCode = `
self.onmessage = function (e) {
  const { remoteShapes, localShapes, currentUser } = e.data;

  try {
    // Create a Map from the localShapes array
    const localLookup = new Map(localShapes.map((shape) => [shape.id, shape]));
    const remoteShapeIdsSet = new Set(remoteShapes.map(shape => shape.id));

    const toAdd = [];
    const toUpdate = [];
    const toRemove = [];

    for (const remoteShape of remoteShapes) {
      if (!remoteShape.id) continue;

      const localShape = localLookup.get(remoteShape.id);

      if (!localShape) {
        delete remoteShape.isModerator;
        delete remoteShape.questionType;
        toAdd.push(remoteShape);
      } else {
        const { createdBy, updatedBy } = remoteShape.meta || {};
        const isCreatedByCurrentUser = createdBy === currentUser?.userId;
        const isUpdatedByCurrentUser = updatedBy === currentUser?.userId;

        if (isCreatedByCurrentUser && isUpdatedByCurrentUser) continue;

        const diff = { ...remoteShape };
        delete diff.isModerator;
        delete diff.questionType;
        toUpdate.push(diff);
      }
    }

    for (const localShape of localShapes) {
      if (!remoteShapeIdsSet.has(localShape.id) && !localShape.id?.includes('shape:BG-')) {
        toRemove.push(localShape.id);
      }
    }

    // Send the processed data back to the main thread
    self.postMessage({ toAdd, toUpdate, toRemove });
  } catch (error) {
    self.postMessage({ error: 'Error in worker: ' + error.message });
  }
};
`;

const Utils = {
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage,
};

export default Utils;
export {
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage, isValidShapeType, cursorWorkerCode, shapesWorkerCode
};
