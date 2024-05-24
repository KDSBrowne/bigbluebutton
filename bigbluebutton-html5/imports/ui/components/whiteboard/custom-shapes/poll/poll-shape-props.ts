import { DefaultColorStyle, ShapeProps, T } from '@tldraw/tldraw';
import { IPollShape } from './poll-shape-types';

export const pollShapeProps: ShapeProps<IPollShape> = {
  w: T.number,
  h: T.number,
  color: DefaultColorStyle,
  question: T.string,
  numRespondents: T.number,
  numResponders: T.number,
  questionText: T.string,
  questionType: T.string,
  answers: Array<{
    id: number,
    key: string,
    numVotes: number,
  }>,
};

export default pollShapeProps;
