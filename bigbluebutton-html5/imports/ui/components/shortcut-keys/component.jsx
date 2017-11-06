import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import styles from './styles';

const intlMessages = defineMessages({
  shortcutTitleLabel: {
    id: 'app.shortcutKeys.shortcutTitleLabel',
    description: 'shorcut modal title',
  },
  shortcutLabel: {
    id: 'app.shortcutKeys.shortcutLabel',
    description: 'heading for the shortcut column',
  },
  functionLabel: {
    id: 'app.shortcutKeys.functionLabel',
    description: 'heading for the function column',
  },
  toggleUserListLabel: {
    id: 'app.shortcutKeys.toggleUserListLabel',
    description: 'label for the userlist toggle shortcut',
  },
  togglePubChatLabel: {
    id: 'app.shortcutKeys.togglePubChatLabel',
    description: 'label for then public chat toggle shortcut',
  },
  toggleFullscreenLabel: {
    id: 'app.shortcutKeys.toggleFullscreenLabel',
    description: 'label for then fullscreen toggle shortcut',
  },
  openSettingsLabel: {
    id: 'app.shortcutKeys.openSettingsLabel',
    description: 'label for the open settings shortcut',
  },
  openAboutLabel: {
    id: 'app.shortcutKeys.openAboutLabel',
    description: 'label for the open about shortcut',
  },
  openShortcutsLabel: {
    id: 'app.shortcutKeys.openShortcutsLabel',
    description: 'label for the open shortcuts help modal',
  },
  toggleMuteLabel: {
    id: 'app.shortcutKeys.toggleMuteLabel',
    description: 'label for the toggle mute shortcut',
  },
});

const ShortcutKeysComponent = ({ intl }) => (
  <Modal
    title={intl.formatMessage(intlMessages.shortcutTitleLabel)}
    dismiss={{
      label: 'close',
      description: 'exit modal',
    }}
  >
    <table className={styles.table}>
      <tbody>
        <tr>
          <th className={styles.th}>{intl.formatMessage(intlMessages.shortcutLabel)}</th>
          <th className={styles.th}>{intl.formatMessage(intlMessages.functionLabel)}</th>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 1</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.toggleUserListLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 2</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.togglePubChatLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 3</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openSettingsLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 4</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.toggleFullscreenLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + M</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.toggleMuteLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + I</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openAboutLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + H</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openShortcutsLabel)}
          </td>
        </tr>
      </tbody>
    </table>
  </Modal>
);

export default injectIntl(ShortcutKeysComponent);
