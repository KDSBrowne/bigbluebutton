import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationService from '/imports/ui/components/presentation/service';
import SpeechRecognition from './component';
import PresentationToolbarService from '/imports/ui/components/presentation/presentation-toolbar/service';

const SpeechRecognitionContainer = props => (<SpeechRecognition {...{ props }} />);

export default withTracker(props => ({
}))(SpeechRecognitionContainer);

SpeechRecognitionContainer.propTypes = {
};
