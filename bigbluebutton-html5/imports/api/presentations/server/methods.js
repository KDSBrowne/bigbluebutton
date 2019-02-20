import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';
import fitSlideToWidth from './methods/fitSlideToWidth';

Meteor.methods({
  removePresentation,
  setPresentation,
  fitSlideToWidth,
});
