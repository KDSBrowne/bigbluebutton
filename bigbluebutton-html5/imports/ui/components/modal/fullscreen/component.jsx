import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import ModalBase, { withModalState } from '../base/component';
import styles from './styles.scss';


const propTypes = {
  title: PropTypes.string.isRequired,
  confirm: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};

const defaultProps = {
  shouldCloseOnOverlayClick: false,
  confirm: {
    label: 'Done',
    description: 'Saves changes and closes the modal',
  },
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
  },
};

class ModalFullscreen extends Component {
  handleAction(name) {
    const action = this.props[name];
    this.props.modalHide(action.callback);
  }

  render() {
    const {
      title,
      confirm,
      dismiss,
      className,
      modalisOpen,
      ...otherProps
    } = this.props;

    return (
      <ModalBase
        isOpen={modalisOpen}
        className={cx(className, styles.modal)}
        contentLabel={title}
        {...otherProps}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            <Button
              color={'primary'}
              className={styles.dismiss}
              label={dismiss.label}
              onClick={() => this.handleAction('dismiss')}
              aria-describedby={'modalDismissDescription'}
            />
            <Button
              color={'primary'}
              className={styles.confirm}
              label={confirm.label}
              onClick={() => this.handleAction('confirm')}
              aria-describedby={'modalConfirmDescription'}
            />
          </div>
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{dismiss.description}</div>
        <div id="modalConfirmDescription" hidden>{confirm.description}</div>
      </ModalBase>
    );
  }
}

ModalFullscreen.propTypes = propTypes;
ModalFullscreen.defaultProps = defaultProps;

export default withModalState(ModalFullscreen);
