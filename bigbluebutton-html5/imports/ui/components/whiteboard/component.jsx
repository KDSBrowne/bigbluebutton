import * as React from "react";

import { TldrawApp, Tldraw } from "@tldraw/tldraw";

export default function Whiteboard(props) {
  const { isPresenter, initDefaultPages } = props;
  const { pages, pageStates } = initDefaultPages();
  const rDocument = React.useRef({
    // name: 'test',
    version: TldrawApp.version,
    // id: 'doc',
    pages,
    pageStates,
  });

  const [doc, setDoc] = React.useState(rDocument.current);

  const handleChange = React.useCallback((state) => {
    rDocument.current = state.document;
  }, []);

  return (
    <Tldraw
      document={doc}
      onChange={handleChange}
      onPersist={(e) => {
        console.log("onPersist : ", e.getShapes());
      }}
      showPages={isPresenter}
      showUI={isPresenter}
      showMenu={false}
      showMultiplayerMenu={false}
      readOnly={!isPresenter}
    />
  );
}
