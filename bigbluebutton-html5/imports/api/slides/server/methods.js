import { Meteor } from 'meteor/meteor';
import switchSlide from './methods/switchSlide';
import zoomSlide from './methods/zoomSlide';
import addShape from './methods/addShape';
import removeShape from './methods/removeShape';

Meteor.methods({
  switchSlide,
  zoomSlide,
  persistShape: addShape,
  removeShape,
});
