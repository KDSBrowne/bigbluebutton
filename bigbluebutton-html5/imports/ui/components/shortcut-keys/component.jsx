import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import styles from './styles';

const intlMessages = defineMessages({
  shortcutTitleLabel: {
    id: 'app.shortcutKeys.shortcutTitleLabel',
    description: '',
  },
  shortcutLabel: {
    id: 'app.shortcutKeys.shortcutLabel',
    description: 'heading for shortcut keys table',
  },
  functionLabel: {
    id: 'app.shortcutKeys.functionLabel',
    description: 'heading for shortcut keys table',
  },
  toggleUserListLabel: {
    id: 'app.shortcutKeys.toggleUserListLabel',
    description: '',
  },
  togglePubChatLabel: {
    id: 'app.shortcutKeys.togglePubChatLabel',
    description: '',
  },
  toggleFullscreenLabel: {
    id: 'app.shortcutKeys.toggleFullscreenLabel',
    description: '',
  },
  openSettingsLabel: {
    id: 'app.shortcutKeys.openSettingsLabel',
    description: '',
  },
  openAboutLabel: {
    id: 'app.shortcutKeys.openAboutLabel',
    description: '',
  },
  openShortcutsLabel: {
    id: 'app.shortcutKeys.openShortcutsLabel',
    description: '',
  },
  toggleMuteLabel: {
    id: 'app.shortcutKeys.toggleMuteLabel',
    description: '',
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
            {intl.formatMessage(intlMessages.toggleFullscreenLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 4</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openSettingsLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 5</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openAboutLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 6</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.openShortcutsLabel)}
          </td>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + 7</td>
          <td className={styles.td}>
            {intl.formatMessage(intlMessages.toggleMuteLabel)}
          </td>
        </tr>
      </tbody>
    </table>
  </Modal>
);

export default injectIntl(ShortcutKeysComponent);
