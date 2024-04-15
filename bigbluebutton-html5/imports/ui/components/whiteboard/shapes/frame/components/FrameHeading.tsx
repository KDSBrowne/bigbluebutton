import {
  SelectionEdge,
  TLShapeId,
  canonicalizeRotation,
  getPointerInfo,
  toDomPrecision,
  useEditor,
  useIsEditing,
  useValue,
} from "@tldraw/editor";
import { useCallback, useEffect, useRef } from "react";
import { FrameLabelInput } from "./FrameLabelInput";
import React from "react";

export const FrameHeading = function FrameHeading({
  id,
  name,
  width,
  height,
}: {
  id: TLShapeId;
  name: string;
  width: number;
  height: number;
}) {
  const editor = useEditor();
  const pageRotation = useValue(
    "shape rotation",
    () => canonicalizeRotation(editor.getShapePageTransform(id)!.rotation()),
    [editor, id]
  );

  const isEditing = useIsEditing(id);

  const rInput = useRef<HTMLInputElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const event = getPointerInfo(e);

      // If we're editing the frame label, we shouldn't hijack the pointer event
      if (editor.getEditingShapeId() === id) return;

      editor.dispatch({
        type: "pointer",
        name: "pointer_down",
        target: "shape",
        shape: editor.getShape(id)!,
        ...event,
      });
      e.preventDefault();
    },
    [editor, id]
  );

  useEffect(() => {
    const el = rInput.current;
    if (el && isEditing) {
      // On iOS, we must focus here
      el.focus();
      el.select();

      requestAnimationFrame(() => {
        // On desktop, the input may have lost focus, so try try try again!
        if (document.activeElement !== el) {
          el.focus();
          el.select();
        }
      });
    }
  }, [rInput, isEditing]);

  // rotate right 45 deg
  const offsetRotation = pageRotation + Math.PI / 4;
  const scaledRotation = (offsetRotation * (2 / Math.PI) + 4) % 4;
  const labelSide: SelectionEdge = (
    ["top", "left", "bottom", "right"] as const
  )[Math.floor(scaledRotation)];

  let labelTranslate: string;
  switch (labelSide) {
    case "top":
      labelTranslate = ``;
      break;
    case "right":
      labelTranslate = `translate(${toDomPrecision(
        width
      )}px, 0px) rotate(90deg)`;
      break;
    case "bottom":
      labelTranslate = `translate(${toDomPrecision(width)}px, ${toDomPrecision(
        height
      )}px) rotate(180deg)`;
      break;
    case "left":
      labelTranslate = `translate(0px, ${toDomPrecision(
        height
      )}px) rotate(270deg)`;
      break;
  }

  return (
    <div
      className="tl-frame-heading"
      style={{
        overflow: isEditing ? "visible" : "hidden",
        maxWidth: `calc(var(--tl-zoom) * ${
          labelSide === "top" || labelSide === "bottom"
            ? Math.ceil(width)
            : Math.ceil(height)
        }px + var(--space-5))`,
        bottom: "100%",
        transform: `${labelTranslate} scale(var(--tl-scale)) translateX(calc(-1 * var(--space-3))`,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="tl-frame-heading-hit-area">
        <FrameLabelInput
          ref={rInput}
          id={id}
          name={name}
          isEditing={isEditing}
        />

        <button
          onClick={() => {
            if (editor.getCamera()?.z !== 0.1) {
              editor.setCamera({ x: -50, y: -50, z: 0.1 }, false);
              return;
            }

            const myBounds = editor.getShapePageBounds(
              editor.getSelectedShapes()[0]
            );

            // You can adjust the `targetZoom` value to zoom in closer than the default behavior.
            // For example, a `targetZoom` of 2 would attempt to zoom in twice as close,
            // while maintaining the aspect ratio of the bounds.
            editor.zoomToBounds(myBounds, { inset: 150 });
          }}
        >
          {"[F]" }
        </button>
      </div>
    </div>
  );
};
