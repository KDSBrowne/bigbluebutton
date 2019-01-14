import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';
import togglePresentationWidth from './methods/togglePresentationWidth';

Meteor.methods({
  removePresentation,
  setPresentation,
  togglePresentationWidth,
});
