import React from 'react';
import Modal from '/imports/ui/components/modal/simple/component';
import styles from './styles';

const ShortcutKeysComponent = () => (
  <Modal
    title={'Shortcut Keys'}
    dismiss={{
      label: 'close',
      description: 'exit modal',
    }}
  >
    <table className={styles.table}>
      <tbody>
        <tr>
          <th className={styles.th}>shotcut</th>
          <th className={styles.th}>function</th>
        </tr>
        <tr>
          <td className={styles.td}>Ctrl + Alt + g</td>
          <td className={styles.td}>Toggle User List</td>
        </tr>
        <tr>
          <td className={styles.td}>2</td>
          <td className={styles.td}>Toggle Public Chat</td>
        </tr>
        <tr>
          <td className={styles.td}>3</td>
          <td className={styles.td}>Toggle Fullscreen</td>
        </tr>
        <tr>
          <td className={styles.td}>4</td>
          <td className={styles.td}>Open Settings Modal</td>
        </tr>
        <tr>
          <td className={styles.td}>5</td>
          <td className={styles.td}>Open About Modal</td>
        </tr>
        <tr>
          <td className={styles.td}>6</td>
          <td className={styles.td}>Open Shotcut Key Modal</td>
        </tr>
        <tr>
          <td className={styles.td}>7</td>
          <td className={styles.td}>Mute and Unmute microphone</td>
        </tr>
      </tbody>
    </table>
  </Modal>
);

export default ShortcutKeysComponent;
