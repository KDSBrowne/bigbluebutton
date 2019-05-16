import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { styles } from './styles';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import ShortcutHelpComponent from '/imports/ui/components/shortcut-help/component';
import AudioModalContainer from '/imports/ui/components/audio/audio-modal/container';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';

const propTypes = {
};

const defaultProps = {
};

//---------------------------------------------------------------------

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SR();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-CA';

class SpeechRecognition extends Component {
  constructor() {
    super();
    this.state = {
      listening: false,
      enableCommands: false,
      history: false,
    };
    this.spoken = [];

    this.toggleHistory = this.toggleHistory.bind(this);
    this.toggleListen = this.toggleListen.bind(this);
    this.handleListen = this.handleListen.bind(this);
  }

  toggleListen() {
    this.setState({
      listening: !this.state.listening,
    }, this.handleListen);
  }

  toggleHistory() {
    this.setState({
      history: !this.state.history,
    });
  }

  handleListen() {
    console.log('listening?', this.state.listening);

    if (this.state.listening) {
      recognition.start();
      recognition.onend = () => {
        console.log('...continue listening...');
        recognition.start();
      };
    } else {
      recognition.stop();
      recognition.onend = () => {
        console.log('Stopped listening per click');
      };
    }

    recognition.onstart = () => {
      console.log('Listening!');
    };

    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += `${transcript} `;
        else interimTranscript += transcript;
      }


      document.getElementById('interim').innerHTML = interimTranscript;
      document.getElementById('final').innerHTML = finalTranscript;

      // -------------------------COMMANDS------------------------------------

      const transcriptArr = finalTranscript.split(' ');
      const stopCmd = transcriptArr.slice(-3, -1);
      console.log('stopCmd', stopCmd);

      const hideSubPanel = stopCmd[0] === 'hide'
          && (
            stopCmd[1] === 'public'
            || stopCmd[1] === 'polling'
            || stopCmd[1] === 'note'
            || stopCmd[1] === 'rooms'
          );

      const hideMainPanel = stopCmd[0] === 'hide' && stopCmd[1] === 'users';

      if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening') {
        const utterance = new SpeechSynthesisUtterance("I'am no longer listening, Goodbye");
        speechSynthesis.speak(utterance);
        recognition.stop();
        recognition.onend = () => {
          console.log('Stopped listening per command');
          const finalText = transcriptArr.slice(0, -3).join(' ');
          document.getElementById('final').innerHTML = finalText;
        };
      }

      if (stopCmd[0] === 'enable' && stopCmd[1] === 'commands') {
        const utterance = new SpeechSynthesisUtterance('Voice commands enabled');
        speechSynthesis.speak(utterance);
        this.setState({ enableCommands: true });
      }

      if (stopCmd[0] === 'disable' && stopCmd[1] === 'commands') {
        const utterance = new SpeechSynthesisUtterance('Voice commands disabled');
        speechSynthesis.speak(utterance);
        this.setState({ enableCommands: false });
      }

      if (!this.state.enableCommands) {
        var date = new Date();
        var timestamp = date.toLocaleString();
        this.spoken.push(`${timestamp}: ${finalTranscript}`);
        return finalTranscript = '';
      }

      if (hideSubPanel) {
        Session.set('openPanel', 'userlist');
        Session.set('idChatOpen', '');
      }

      if (hideMainPanel) {
        Session.set('openPanel', '');
        Session.set('idChatOpen', '');
      }
      // Open users list panel command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'users') {
        Session.set('openPanel', 'userlist');
      }
      // Open public chat command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'public') {
        Session.set('openPanel', 'chat');
        Session.set('idChatOpen', 'public');
      }
      // Open polling panel command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'polling') {
        Session.set('openPanel', 'poll');
      }
      // Open shared notes panel command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'notes') {
        Session.set('openPanel', 'note');
      }
      // Open Breakoutroom panel command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'rooms') {
        Session.set('openPanel', 'breakoutroom');
      }
      // Next slide command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'about') {
        this.props.mountModal(<AboutContainer />);
      }
      // Previous slide command
      if (stopCmd[0] === 'show' && stopCmd[1] === 'hotkeys') {
        this.props.mountModal(<ShortcutHelpComponent />);
      }
      // open setting command
      if (stopCmd[0] === 'open' && stopCmd[1] === 'settings') {
        this.props.mountModal(<SettingsMenuContainer />);
      }
      // open audio modal command
      if (stopCmd[0] === 'join' && stopCmd[1] === 'audio') {
        this.props.mountModal(<AudioModalContainer />);
      }
      // open webcam modal command
      if (stopCmd[0] === 'share' && stopCmd[1] === 'webcam') {
        this.props.mountModal(<VideoPreviewContainer />);
      }

      var date = new Date();
      var timestamp = date.toLocaleString();
      this.spoken.push(`${timestamp}: ${finalTranscript}`);
      finalTranscript = '';
    };

    //-----------------------------------------------------------------------

    recognition.onerror = (event) => {
      console.log(`Error occurred in recognition: ${event.error}`);
    };
  }

  render() {
    const filtered = this.spoken.map((words) => {
      if (!words.match(/:[ ]$/g)) {
        return words;
      }
      return null;
    });

    const thingsSaid = _.compact(filtered);

    const history = (
      <div>
        <h3>History</h3>
        <div id="history" className={styles.history}>
          {thingsSaid}
        </div>
      </div>
    );

    return (
      <div className={styles.container}>
        <button id="microphone-btn" className={styles.button} onClick={this.toggleListen} />
        <h3>Interm</h3>
        <div id="interim" className={styles.interim} />
        <h3>Final</h3>
        <div id="final" className={styles.final} />
        <button id="history-btn" className={styles.button} onClick={this.toggleHistory} />
        {this.state.history ? history : null}
      </div>
    );
  }
}

export default withModalMounter(SpeechRecognition);

SpeechRecognition.defaultProps = defaultProps;
SpeechRecognition.propTypes = propTypes;
