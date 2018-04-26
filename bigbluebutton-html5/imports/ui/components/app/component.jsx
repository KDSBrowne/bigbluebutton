import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Modal from 'react-modal';
import cx from 'classnames';
import { findDOMNode } from 'react-dom';

import ToastContainer from '../toast/container';
import ModalContainer from '../modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatNotificationContainer from '../chat/notification/container';
import { styles } from './styles';

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  mediaLabel: {
    id: 'app.media.label',
    description: 'Aria-label for Media Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
});

const propTypes = {
  fontSize: PropTypes.string,
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  closedCaption: PropTypes.element,
  userList: PropTypes.element,
  chat: PropTypes.element,
  locale: PropTypes.string,
  intl: intlShape.isRequired,
};

const defaultProps = {
  fontSize: '16px',
  navbar: null,
  sidebar: null,
  media: null,
  actionsbar: null,
  closedCaption: null,
  userList: null,
  chat: null,
  locale: 'en',
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      compactUserList: false, // TODO: Change this on userlist resize (?)
      ulWidth: 0,
    };

    this.initULResize = this.initULResize.bind(this);
    this.startULResize = this.startULResize.bind(this);
    this.stopULResize = this.stopULResize.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    const VISIBLE_HANDLE_SIZE = 4;
    const HIDDEN_HANDLE_SIZE = 0;
    this.ulHandle.style.width = window.location.pathname === '/html5client/' ? `${HIDDEN_HANDLE_SIZE}px` : `${VISIBLE_HANDLE_SIZE}px`;
  }

  componentDidMount() {
    const { locale } = this.props;

    Modal.setAppElement('#app');
    document.getElementsByTagName('html')[0].lang = locale;
    document.getElementsByTagName('html')[0].style.fontSize = this.props.fontSize;

    if (this.ulHandle) {
      this.ulHandle.addEventListener('mousedown', this.initULResize, false);
      this.ulHandle.style.width = '4px';
    }
  }

  initULResize() {
    window.addEventListener('mousemove', this.startULResize, false);
    window.addEventListener('mouseup', this.stopULResize, false);
  }

  startULResize(e) {
    const userList = findDOMNode(this.userList);
    userList.style.width = `${e.clientX - userList.offsetLeft}px`;

    if (e.clientX - userList.offsetLeft <= 80) {
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('mouseup', true, true);
      userList.dispatchEvent(clickEvent);
      this.props.router.push('/');
      this.setState({ compactUserList: true });
    }

    this.setState({ ulWidth: (e.clientX - userList.offsetLeft) });
  }

  stopULResize(e) {
    window.removeEventListener('mousemove', this.startULResize, false);
    window.removeEventListener('mouseup', this.stopULResize, false);
  }

  renderNavBar() {
    const { navbar } = this.props;

    if (!navbar) return null;

    return (
      <header className={styles.navbar}>
        {navbar}
      </header>
    );
  }

  renderSidebar() {
    const { sidebar } = this.props;

    if (!sidebar) return null;

    return (
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
    );
  }

  renderClosedCaption() {
    const { closedCaption } = this.props;

    if (!closedCaption) return null;

    return (
      <div className={styles.closedCaptionBox}>
        {closedCaption}
      </div>
    );
  }

  renderUserList() {
    const { intl } = this.props;
    let { userList } = this.props;
    const { compactUserList, ulWidth } = this.state;

    if (!userList) return null;

    const userListStyle = {};
    userListStyle[styles.compact] = compactUserList;
    userList = React.cloneElement(userList, {
      compact: compactUserList,
      ref: ref => this.userList = ref,
    });

    return (
      <div
        className={cx(styles.userList, userListStyle)}
        aria-label={intl.formatMessage(intlMessages.userListLabel)}
      >
        {userList}
      </div>
    );
  }

  renderChat() {
    const { chat, intl } = this.props;

    if (!chat) return null;

    return (
      <section
        className={styles.chat}
        aria-label={intl.formatMessage(intlMessages.chatLabel)}
      >
        {chat}
      </section>
    );
  }

  renderMedia() {
    const { media, intl } = this.props;

    if (!media) return null;

    return (
      <section
        className={styles.media}
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}
      >
        {media}
        {this.renderClosedCaption()}
      </section>
    );
  }

  renderActionsBar() {
    const { actionsbar, intl } = this.props;

    if (!actionsbar) return null;

    return (
      <section
        className={styles.actionsbar}
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
      >
        {actionsbar}
      </section>
    );
  }

  render() {
    const { params } = this.props;

    return (
      <main className={styles.main}>
        <NotificationsBarContainer />
        <section className={styles.wrapper}>
          <div
            className={styles.ulWrapper}
            ref={(node) => { this.ulWrapper = node; }}
          >
            {this.renderUserList()}
              <div
                className={styles.ulHandle}
                ref={(node) => { this.ulHandle = node; }}
              />
          </div>
          {this.renderChat()}
          <div className={styles.content}>
            {this.renderNavBar()}
            {this.renderMedia()}
            {this.renderActionsBar()}
          </div>
          {this.renderSidebar()}
        </section>
        <ModalContainer />
        <AudioContainer />
        <ToastContainer />
        <ChatNotificationContainer currentChatID={params.chatID} />
      </main>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
export default injectIntl(App);
