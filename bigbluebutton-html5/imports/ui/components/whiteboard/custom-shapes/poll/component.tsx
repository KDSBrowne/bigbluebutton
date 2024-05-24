import React, { useRef } from 'react';
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  TLOnResizeHandler,
  getDefaultColorTheme,
  resizeBox,
} from "@tldraw/tldraw";
import { pollShapeMigrations } from './poll-shape-migrations';
import { pollShapeProps } from './poll-shape-props';
import { IPollShape } from './poll-shape-types';
import ChatPollContent from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/chat-message/message-content/poll-content/component';

class PollShapeUtil extends ShapeUtil<IPollShape> {
  static override type = 'poll' as const;

  static override props = pollShapeProps;

  static override migrations = pollShapeMigrations;

  override isAspectRatioLocked = () => false;

  override canResize = () => true;

  override canBind = () => true;

  getDefaultProps(): IPollShape['props'] {
    return {
      w: 1,
      h: 1,
      color: 'black',
      question: '',
      numRespondents: 0,
      numResponders: 0,
      questionText: '',
      questionType: '',
      answers: [],
    };
  }

  /* eslint-disable class-methods-use-this */
  getGeometry(shape: IPollShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IPollShape) {
    const { bounds } = this.editor.getShapeGeometry(shape);
    const theme = getDefaultColorTheme({
      isDarkMode: this.editor.user.getIsDarkMode(),
    });

    const contentRef = useRef<HTMLDivElement>(null);
    const pollMetadata = JSON.stringify({
      id: shape.id,
      question: shape.props.question,
      numRespondents: shape.props.numRespondents,
      numResponders: shape.props.numResponders,
      questionText: shape.props.questionText,
      questionType: shape.props.questionType,
      answers: shape.props.answers,
    });

    const adjustedHeight = shape.props.questionText.length > 0 ? bounds.height - 75 : bounds.height;

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          border: '1px solid black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backgroundColor: theme[shape.props.color].semi,
          color: theme[shape.props.color].solid,
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${bounds.width}px`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ChatPollContent
            metadata={pollMetadata}
            height={adjustedHeight}
          />
        </div>
      </HTMLContainer>
    );
  }

  /* eslint-disable class-methods-use-this */
  indicator(shape: IPollShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize: TLOnResizeHandler<IPollShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
}

export default PollShapeUtil;
