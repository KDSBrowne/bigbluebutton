import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  intl,
  toggleBreakoutRoomPanel,
}) => {
  if (hasBreakoutRoom) {
    return (
      <div role="button" onClick={toggleBreakoutRoomPanel}>
        <h2 className={styles.smallTitle}> {intl.formatMessage(intlMessages.breakoutTitle).toUpperCase()}</h2>
        <div className={styles.BreakoutRoomsItem}>
          <div className={styles.BreakoutRoomsContents}>
            <div className={styles.BreakoutRoomsIcon} >
              <Icon iconName="rooms" />
            </div>
            <span className={styles.BreakoutRoomsText}>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
          </div>
        </div>
      </div>
    );
  }
  return <span />;
};

export default injectIntl(BreakoutRoomItem);
