import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, IntlProvider } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const propTypes = {
  code: PropTypes.string.isRequired,
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const language = 'en';

// Usually messages is declared in another file.
const messages = {
  'app.meeting.endedMessage': 'You will be forwarded back to the home screen',
  'app.meeting.ended': 'This session has ended',
  'app.error.removed': 'You have been removed from the meeting',
  'app.meeting.endNotification.ok.label': 'OK',
};

const mesg = defineMessages({
  endMsg: {
    id: 'app.meeting.endedMessage',
    description: 'message to user that they will be redirected to home screen',
  },
  ended: {
    id: 'app.meeting.ended',
    description: 'meeting has ended message',
  },
  kicked: {
    id: 'app.error.removed',
    description: 'user was removed from meeting message',
  },
  ok: {
    id: 'app.meeting.endNotification.ok.label',
    description: 'end screen ok button label',
  },
});

class MeetingEnded extends React.PureComponent {
  render() {
    const { router, code } = this.props;
    const { intl } = new IntlProvider({ locale: language, messages }, {}).getChildContext();

    let message;
    if (code === '403') { message = intl.formatMessage(mesg.kicked); }
    if (code === '410') { message = intl.formatMessage(mesg.ended); }

    return (
      <div className={styles.parent}>
        <div className={styles.modal}>
          <div className={styles.content}>
            <h1 className={styles.title}>{message}</h1>
            <div className={styles.text}>
              {intl.formatMessage(mesg.endMsg)}
            </div>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(mesg.ok)}
              size="sm"
              onClick={() => router.push('/logout')}
            />
          </div>
        </div>
      </div>
    );
  }
}

MeetingEnded.propTypes = propTypes;

export default withRouter(MeetingEnded);
