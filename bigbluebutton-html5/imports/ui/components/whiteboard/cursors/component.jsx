import * as React from "react";
import ReactCursorPosition from "react-cursor-position";

const renderCursor = (name, color, x, y) => {
  return (
    <>
      <div
        style={{
          zIndex: 9999999,
          position: "absolute",
          left: x - 2.5,
          top: y - 2.5,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: `${color}`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          zIndex: 9999999,
          position: "absolute",
          left: x + 3.75,
          top: y + 3,
          paddingLeft: ".25rem",
          paddingRight: ".25rem",
          paddingBottom: ".1rem",
          lineHeight: "1rem",
          borderRadius: "2px",
          color: "#FFF",
          backgroundColor: color,
          border: `1px solid ${color}`,
        }}
      >
        {name}
      </div>
    </>
  );
};

const PositionLabel = (props) => {
  const {
    detectedEnvironment: {
      isMouseDetected = false,
      isTouchDetected = false,
    } = {},
    elementDimensions: { width = 0, height = 0 } = {},
    isActive = false,
    isPositionOutside = false,
    position: { x = 0, y = 0 } = {},
    currentUser,
    publishCursorUpdate,
  } = props;

  const { name, color, userId } = currentUser;

  React.useEffect(() => {
    console.log("Cursor Position :", x, y, publishCursorUpdate, props);
    props.publishCursorUpdate(userId, name, x, y)
  }, [x,y])


  return (
    <div style={{ position: "absolute", height: "100%", width: "100%" }}>
      {isActive && renderCursor(name, color, x, y)}
    </div>
  );
};

export default function Cursors(props) {
  return (
    <ReactCursorPosition style={{ height: "100%", cursor: "none" }}>
      <PositionLabel currentUser={props.currentUser} publishCursorUpdate={props.publishCursorUpdate} />
      {props.children}
    </ReactCursorPosition>
  );
}
