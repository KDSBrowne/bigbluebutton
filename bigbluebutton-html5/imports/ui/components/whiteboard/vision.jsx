import * as React from "react";
import _ from "lodash";
import { createGlobalStyle } from "styled-components";
import {
    ColorStyle,
    DashStyle,
    SizeStyle,
    TDDocument,
    TDShapeType,
    TDSnapshot,
    Tldraw,
    TldrawApp,
  } from '@tldraw/tldraw'
import GridLayout from "react-grid-layout";

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

function usePrevious(value) {
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
}

export default function Vision(props) {
    const prevShapes = usePrevious(props.shapes);
    const [docCpy, setDoc] = React.useState({
        "name": props.uid,
        "version": 15.5,
        "id": "64b45b61d101b1398f19adfa0c9525604f418834-1669726825979/1",
        "pages": {
            "1": {
                "id": "1",
                "name": "Slide 1",
                "shapes": {},
                "bindings": {}
            },
        },
        "pageStates": {
            "1": {
                "id": "1",
                "selectedIds": [],
                "camera": {
                    "point": [0, 0],
                    "zoom": 0.1
                }
            },
        },
        "bindings": {},
        "assets": props.assets
    });

    if (!_.isEqual(prevShapes, props.shapes)) {
        docCpy.pages[1].shapes = props.shapes;
    } else {
        docCpy.pages[1].shapes = prevShapes;
    }

    return (

          <Tldraw
            key={props.uid}
            document={docCpy}
            onMount={(api) => {
                api?.setSetting('isDarkMode', false);
                // api?.zoomToFit();
                const resizeHandles = document.getElementsByClassName('react-resizable-handle react-resizable-handle-se');
                for (var i = 0; i < resizeHandles.length; i++) {
                  resizeHandles[i].style.zIndex = 10;
                  resizeHandles[i].style.bottom = '-28px';
                  resizeHandles[i].style.marginBottom = '10px';
                }
            }}
            // disable the ability to drag and drop files onto the whiteboard
            // until we handle saving of assets in akka.
            disableAssets={true}
            // Disable automatic focus. Users were losing focus on shared notes
            // and chat on presentation mount.
            autofocus={false}
            showPages={false}
            showZoom={false}
            showUI={false}
            showMenu={false}
            showMultiplayerMenu={false}
            readOnly={true}
          />
  );
}
