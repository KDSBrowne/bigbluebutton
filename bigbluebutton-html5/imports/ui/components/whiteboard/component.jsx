import * as React from "react";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";

const findRemoved = (A, B) => {
  return A.filter((a) => {
    return !B.includes(a);
  });
};

export default function Whiteboard(props) {
  const {
    isPresenter,
    removeShape,
    initDefaultPages,
    meetingId,
    persistShape,
    shapes,
    currentUser,
    publishCursorUpdate,
  } = props;
  const { pages, pageStates } = initDefaultPages();
  const rDocument = React.useRef({
    name: "test",
    version: TldrawApp.version,
    id: `WB-${meetingId}`,
    pages,
    pageStates,
    assets: {},
  });
  const [doc, setDoc] = React.useState(rDocument.current);
  const handleChange = React.useCallback((state) => {
    rDocument.current = state.document;
  }, []);

  React.useEffect(() => {
    const currentDoc = rDocument.current;
    const propShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);
    for (let i = 0; i < Object.keys(currentDoc?.pages).length; i++) {
      const localShapes = Object.entries(currentDoc?.pages[i + 1]?.shapes)?.map(
        ([k, v]) => v.id
      );
      const removeShapes = findRemoved(localShapes, propShapes);
      removeShapes.forEach((s) => {
        delete currentDoc?.pages[i + 1]?.shapes[s];
      });
    }
    const next = { ...currentDoc };
    shapes.forEach((s) => {
      next.pages[s.parentId] = {
        ...next.pages[s.parentId],
        shapes: {
          ...next.pages[s.parentId].shapes,
          [s.id]: { ...s },
        },
      };
    });
    rDocument.current = next;
    setDoc(next);
  }, [shapes]);

  // console.log('##########' , publishCursorUpdate)

  return (
    <Cursors currentUser={currentUser} publishCursorUpdate={publishCursorUpdate}>
      <Tldraw
        document={doc}
        onChange={handleChange}
        onPersist={(e) => {
          console.log("onPersist ", e, e.getShapes(), e.assets);
          const updatedShapes = [];
          Object.entries(e?.selectedIds)?.forEach(([k, v]) => {
            updatedShapes.push(e.getShape(v));
            persistShape(e.getShape(v));
          });

          if (e?.selectedIds.length < 1) {
            Object.entries(e.getShapes())?.forEach(([k, v]) => {
              if (v.type === "draw") persistShape(v);
            });
          }

          const propShapes = Object.entries(shapes || {})?.map(
            ([k, v]) => v.id
          );
          const localShapes = Object.entries(e.getShapes())?.map(
            ([k, v]) => v.id
          );
          const removedShapes = findRemoved(propShapes, localShapes);
          if (removedShapes && removedShapes.length > 0) {
            removedShapes.forEach((s) => removeShape(s));
          }
        }}
        showPages={true || isPresenter}
        showUI={true || isPresenter}
        showMenu={false}
        showMultiplayerMenu={false}
        // readOnly={!isPresenter}
      />
    </Cursors>
  );
}
