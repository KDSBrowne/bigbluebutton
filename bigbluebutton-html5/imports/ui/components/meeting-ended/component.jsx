import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import Settings from '/imports/ui/services/settings';
import { styles } from './styles';

const propTypes = {
  code: PropTypes.string.isRequired,
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const messageIds = [
  'app.meeting.endedMessage', // message to user that they will be redirected to home screen
  'app.meeting.ended', // meeting has ended message
  'app.error.removed', // user was removed from meeting message
  'app.meeting.endNotification.ok.label', // end screen ok button label
];

class MeetingEnded extends React.PureComponent {
  constructor() {
    super();

    this.getStringForId = this.getStringForId.bind(this);
  }

  async componentDidMount() {
    const url = `/html5client/locale?locale=${Settings.application.locale}`;
    await fetch(url)
      .then(async (response) => {
        const localeJSON = await response.json();
        const filteredMsgs = Object.keys(localeJSON.messages)
          .filter(key => messageIds.includes(key))
          .reduce((obj, key) => {
            obj[key] = localeJSON.messages[key];
            return obj;
          }, {});

        this.setState({ messages: filteredMsgs });
      });
  }

  getStringForId(id) {
    const { messages } = this.state;

    return Object.keys(messages)
      .filter(key => id.includes(key))
      .reduce((obj, key) => messages[key], {});
  }

  render() {
    if (!this.state) {
      return (
        <div className={styles.parent}>
          <div className={styles.modal} />
        </div>
      );
    }

    const { router, code } = this.props;
    const { messages } = this.state;

    const okBtnLable = this.getStringForId('app.meeting.endNotification.ok.label');
    const redirectMsg = this.getStringForId('app.meeting.endedMessage');
    const msg403 = this.getStringForId('app.meeting.ended');
    const msg410 = this.getStringForId('app.error.removed');

    let modalTitle;
    if (code === '403') { modalTitle = msg403; }
    if (code === '410') { modalTitle = msg410; }

    return (
      <div className={styles.parent}>
        <div className={styles.modal}>
          {
            this.state && messages && (
              <div className={styles.content}>
                <h1 className={styles.title}>{modalTitle}</h1>
                <div className={styles.text}>
                  {redirectMsg}
                </div>
                <Button
                  color="primary"
                  className={styles.button}
                  label={okBtnLable}
                  size="sm"
                  onClick={() => router.push('/logout')}
                />
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

MeetingEnded.propTypes = propTypes;

export default withRouter(MeetingEnded);
