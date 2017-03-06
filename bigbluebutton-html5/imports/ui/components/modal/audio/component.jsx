import React, { Component, PropTypes } from 'react';
import { clearModal } from '/imports/ui/components/app/service';
import ModalBase from '../base/component';
import Button from '../../button/component';
import styles from '../styles.scss';
import cx from 'classnames';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};

const defaultProps = {
  isOpen: true,
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
  },
};

export default class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: this.props.isOpen,
    };

    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleDismiss() {
    const { dismiss } = this.props;
    dismiss.callback(...arguments);
    this.setState({ isOpen: false });
    clearModal();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isOpen !== this.props.isOpen
      && this.state.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
  }

  render() {
    const {
      dismiss,
    } = this.props;

    const { isOpen } = this.state;

    return (
      <ModalBase
        className={styles.modal}
        isOpen={isOpen}
        onHide={dismiss.callback}
        onShow={this.props.onShow}
        isTransparent={true}
      >
        <div className={styles.actions}>
          <Button className={styles.closeBtn}
            label={dismiss.label}
            icon={'close'}
            size={'lg'}
            circle={true}
            hideLabel={true}
            onClick={this.handleDismiss}
            aria-describedby={'modalDismissDescription'}/>
          </div>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{dismiss.description}</div>
      </ModalBase>
    );
  }
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
