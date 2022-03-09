import * as React from "react";

import { TldrawApp, Tldraw } from "@tldraw/tldraw";

export default function Whiteboard(props) {
  const { isPresenter, initDefaultPages, meetingId, persistShape, shapes } =
    props;
  const { pages, pageStates } = initDefaultPages();
  const rDocument = React.useRef({
    // name: 'test',
    version: TldrawApp.version,
    id: `WB-${meetingId}`,
    pages,
    pageStates,
  });

  const [doc, setDoc] = React.useState(rDocument.current);

  // const handleChange = React.useCallback((state) => {
  //   console.log(state.status);
  //   rDocument.current = state.document;
  // }, []);

  React.useEffect(() => {
    const currentDoc = rDocument.current;
    const next = {
      ...currentDoc,
      pages: {
        ...currentDoc.pages,
      },
    };
    shapes.forEach((s) => {
      next.pages[s.parentId] = {
        ...currentDoc.pages[s.parentId],
        shapes: {
          ...currentDoc.pages[s.parentId].shapes,
          ...next.pages[s.parentId].shapes,
          [s.id]: { ...s },
        },
      }
    });
    rDocument.current = next;
    setDoc(next);
  }, [shapes]);

  return (
    <Tldraw
      document={doc}
      // onChange={handleChange}
      onPersist={(e) => {
        const updatedShapes = [];
        Object.entries(e?.selectedIds)?.forEach(([k, v]) => {
          updatedShapes.push(e.getShape(v));
          persistShape(e.getShape(v));
        });
        console.log("onPersist - update shapes: ", e, updatedShapes);
      }}
      showPages={isPresenter}
      showUI={isPresenter}
      showMenu={false}
      showMultiplayerMenu={false}
      readOnly={!isPresenter}
    />
  );
}
