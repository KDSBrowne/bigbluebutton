import React from 'react';
import styles from './styles.scss';
import EmojiSelect from './emoji-select/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';

export class ActionsBar extends React.Component {
  constructor() {
    super();
    this.state = {
      screenWidth: window.innerWidth,
    };

    this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange() {
    this.setState({ screenWidth: window.innerWidth });
  }

  render() {
    const {
      isUserPresenter,
      emojiList,
      emojiSelected,
      handleEmojiChange,
    } = this.props;

    const { screenWidth } = this.state;
    const isMobile = screenWidth <= 500;

    return isMobile ?
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          <ActionsDropdown {...{ isUserPresenter }} />
          <AudioControlsContainer />
          {/* <JoinVideo /> */}
          <EmojiSelect options={emojiList} selected={emojiSelected} onChange={handleEmojiChange} />
          <EmojiSelect options={emojiList} selected={emojiSelected} onChange={handleEmojiChange} />
        </div>
      </div>
      :
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{ isUserPresenter }} />
        </div>
        <div className={styles.center}>
          <AudioControlsContainer />
          {/* <JoinVideo /> */}
          <EmojiSelect options={emojiList} selected={emojiSelected} onChange={handleEmojiChange} />
        </div>
      </div>;
  }
}

export default ActionsBar;
