import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { defineMessages, injectIntl } from "react-intl";
import deviceInfo from "/imports/utils/deviceInfo";
import injectWbResizeEvent from "/imports/ui/components/presentation/resize-wrapper/component";
import Button from "/imports/ui/components/common/button/component";
import {
  HUNDRED_PERCENT,
  MAX_PERCENT,
  STEP,
} from "/imports/utils/slideCalcUtils";
import { PresentationToolbarItemType } from "bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/presentation-toolbar-item/enums";
import styledComponents from "./styles";
import ZoomTool from "./zoom-tool/component";
import SmartMediaShareContainer from "./smart-video-share/container";
import TooltipContainer from "/imports/ui/components/common/tooltip/container";
import KEY_CODES from "/imports/utils/keyCodes";
import Spinner from "/imports/ui/components/common/spinner/component";
import Separator from "/imports/ui/components/common/separator/component";
import ReactDOM from "react-dom";
import { AssetRecordType } from "@tldraw/tldraw";

const intlMessages = defineMessages({
  previousSlideLabel: {
    id: "app.presentation.presentationToolbar.prevSlideLabel",
    description: "Previous slide button label",
  },
  previousSlideDesc: {
    id: "app.presentation.presentationToolbar.prevSlideDesc",
    description: "Aria description for when switching to previous slide",
  },
  nextSlideLabel: {
    id: "app.presentation.presentationToolbar.nextSlideLabel",
    description: "Next slide button label",
  },
  nextSlideDesc: {
    id: "app.presentation.presentationToolbar.nextSlideDesc",
    description: "Aria description for when switching to next slide",
  },
  noNextSlideDesc: {
    id: "app.presentation.presentationToolbar.noNextSlideDesc",
    description: "",
  },
  noPrevSlideDesc: {
    id: "app.presentation.presentationToolbar.noPrevSlideDesc",
    description: "",
  },
  skipSlideLabel: {
    id: "app.presentation.presentationToolbar.skipSlideLabel",
    description: "Aria label for when switching to a specific slide",
  },
  skipSlideDesc: {
    id: "app.presentation.presentationToolbar.skipSlideDesc",
    description: "Aria description for when switching to a specific slide",
  },
  goToSlide: {
    id: "app.presentation.presentationToolbar.goToSlide",
    description: "button for slide select",
  },
  selectLabel: {
    id: "app.presentation.presentationToolbar.selectLabel",
    description: "slide select label",
  },
  fitToWidth: {
    id: "app.presentation.presentationToolbar.fitToWidth",
    description: "button for fit to width",
  },
  fitToWidthDesc: {
    id: "app.presentation.presentationToolbar.fitWidthDesc",
    description: "Aria description to display the whole width of the slide",
  },
  fitToPage: {
    id: "app.presentation.presentationToolbar.fitToPage",
    description: "button label for fit to width",
  },
  fitToPageDesc: {
    id: "app.presentation.presentationToolbar.fitScreenDesc",
    description: "Aria description to display the whole slide",
  },
  presentationLabel: {
    id: "app.presentationUploder.title",
    description: "presentation area element label",
  },
  toolbarMultiUserOn: {
    id: "app.whiteboard.toolbar.multiUserOn",
    description: "Whiteboard toolbar turn multi-user on menu",
  },
  toolbarMultiUserOff: {
    id: "app.whiteboard.toolbar.multiUserOff",
    description: "Whiteboard toolbar turn multi-user off menu",
  },
  infiniteCanvasOn: {
    id: "app.whiteboard.toolbar.infiniteCanvasOn",
    description: "Whiteboard toolbar turn infinite canvas on",
  },
  infiniteCanvasOff: {
    id: "app.whiteboard.toolbar.infiniteCanvasOff",
    description: "Whiteboard toolbar turn infinite canvas off",
  },
  pan: {
    id: "app.whiteboard.toolbar.tools.hand",
    description: "presentation toolbar pan label",
  },
});

class PresentationToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      wasFTWActive: false,
      showModal: false,
      usersPerFrame: "",
      numberOfFrames: "",
    };

    this.setWasActive = this.setWasActive.bind(this);
    this.handleFTWSlideChange = this.handleFTWSlideChange.bind(this);
    this.handleSkipToSlideChange = this.handleSkipToSlideChange.bind(this);
    this.change = this.change.bind(this);
    this.renderAriaDescs = this.renderAriaDescs.bind(this);
    this.nextSlideHandler = this.nextSlideHandler.bind(this);
    this.previousSlideHandler = this.previousSlideHandler.bind(this);
    this.fullscreenToggleHandler = this.fullscreenToggleHandler.bind(this);
    this.switchSlide = this.switchSlide.bind(this);
    this.handleSwitchWhiteboardMode =
      this.handleSwitchWhiteboardMode.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.switchSlide);
  }

  componentDidUpdate(prevProps) {
    const {
      zoom,
      setIsPanning,
      fitToWidth,
      fitToWidthHandler,
      currentSlideNum,
    } = this.props;
    const { wasFTWActive } = this.state;

    if (zoom <= HUNDRED_PERCENT && zoom !== prevProps.zoom && !fitToWidth)
      setIsPanning();

    if (
      prevProps?.currentSlideNum !== currentSlideNum &&
      !fitToWidth &&
      wasFTWActive
    ) {
      setTimeout(() => {
        fitToWidthHandler();
        this.setWasActive(false);
      }, 150);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.switchSlide);
  }

  handleFTWSlideChange() {
    const { fitToWidth, fitToWidthHandler } = this.props;
    if (fitToWidth) {
      fitToWidthHandler();
      this.setWasActive(fitToWidth);
    }
  }

  handleSkipToSlideChange(event) {
    const { skipToSlide } = this.props;
    const requestedSlideNum = Number.parseInt(event.target.value, 10);

    this.handleFTWSlideChange();
    if (event) event.currentTarget.blur();
    skipToSlide(requestedSlideNum);
  }

  handleSwitchWhiteboardMode() {
    const {
      multiUser,
      whiteboardId,
      removeWhiteboardGlobalAccess,
      addWhiteboardGlobalAccess,
    } = this.props;
    if (multiUser) {
      return removeWhiteboardGlobalAccess(whiteboardId);
    }
    return addWhiteboardGlobalAccess(whiteboardId);
  }

  setWasActive(wasFTWActive) {
    this.setState({ wasFTWActive });
  }

  fullscreenToggleHandler() {
    const {
      fullscreenElementId,
      isFullscreen,
      layoutContextDispatch,
      fullscreenAction,
      fullscreenRef,
      handleToggleFullScreen,
    } = this.props;

    handleToggleFullScreen(fullscreenRef);
    const newElement = isFullscreen ? "" : fullscreenElementId;

    layoutContextDispatch({
      type: fullscreenAction,
      value: {
        element: newElement,
        group: "",
      },
    });
  }

  nextSlideHandler(event) {
    const { nextSlide, endCurrentPoll } = this.props;

    this.handleFTWSlideChange();
    if (event) event.currentTarget.blur();
    endCurrentPoll();
    nextSlide();
  }

  previousSlideHandler(event) {
    const { previousSlide, endCurrentPoll } = this.props;

    this.handleFTWSlideChange();
    if (event) event.currentTarget.blur();
    endCurrentPoll();
    previousSlide();
  }

  switchSlide(event) {
    const { target, which } = event;
    const isBody = target.nodeName === "BODY";

    if (isBody) {
      switch (which) {
        case KEY_CODES.ARROW_LEFT:
        case KEY_CODES.PAGE_UP:
          this.previousSlideHandler();
          break;
        case KEY_CODES.ARROW_RIGHT:
        case KEY_CODES.PAGE_DOWN:
          this.nextSlideHandler();
          break;
        case KEY_CODES.ENTER:
          this.fullscreenToggleHandler();
          break;
        default:
      }
    }
  }

  change(value) {
    const { zoomChanger } = this.props;
    zoomChanger(value);
  }

  renderToolbarPluginItems() {
    let pluginProvidedItems = [];
    if (this.props) {
      const { pluginProvidedPresentationToolbarItems } = this.props;
      pluginProvidedItems = pluginProvidedPresentationToolbarItems;
    }

    return pluginProvidedItems?.map((ppb) => {
      let componentToReturn;
      const ppbId = ppb.id;

      switch (ppb.type) {
        case PresentationToolbarItemType.BUTTON:
          componentToReturn = (
            <Button
              key={ppbId}
              style={{ marginLeft: "2px" }}
              label={ppb.label}
              onClick={ppb.onClick}
              tooltipLabel={ppb.tooltip}
            />
          );
          break;
        case PresentationToolbarItemType.SPINNER:
          componentToReturn = <Spinner key={ppbId} />;
          break;
        case PresentationToolbarItemType.SEPARATOR:
          componentToReturn = <Separator />;
          break;
        default:
          componentToReturn = null;
      }
      return componentToReturn;
    });
  }

  renderAriaDescs() {
    const { intl } = this.props;
    return (
      <div hidden>
        {/* Aria description's for toolbar buttons */}
        <div id="prevSlideDesc">
          {intl.formatMessage(intlMessages.previousSlideDesc)}
        </div>
        <div id="noPrevSlideDesc">
          {intl.formatMessage(intlMessages.noPrevSlideDesc)}
        </div>
        <div id="nextSlideDesc">
          {intl.formatMessage(intlMessages.nextSlideDesc)}
        </div>
        <div id="noNextSlideDesc">
          {intl.formatMessage(intlMessages.noNextSlideDesc)}
        </div>
        <div id="skipSlideDesc">
          {intl.formatMessage(intlMessages.skipSlideDesc)}
        </div>
        <div id="fitWidthDesc">
          {intl.formatMessage(intlMessages.fitToWidthDesc)}
        </div>
        <div id="fitPageDesc">
          {intl.formatMessage(intlMessages.fitToPageDesc)}
        </div>
      </div>
    );
  }

  handleModalShow() {
    this.setState({ showModal: true });
  }

  handleModalClose() {
    this.setState({ showModal: false });
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleModalSubmit() {
    const { usersPerFrame, numberOfFrames } = this.state;
    const { tlEditor } = this.props;
    // Handle the values as needed
    console.log("Users per frame:", usersPerFrame);
    console.log("Number of frames:", numberOfFrames);
    console.log("editor : ", tlEditor);
    this.handleModalClose();
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleModalClose = () => {
    this.setState({ showModal: false });
  };
/////////////////////


// handleButtonClick = () => {
//   const { usersPerFrame, numberOfFrames } = this.state;
//   const {
//     tlEditor,
//     multiUserWriters,
//     currentPresentationPage,
//     currentUser,
//   } = this.props;


//   // Handle the values as needed
//   // console.log("Users per frame:", usersPerFrame);
//   // console.log("Number of frames:", numberOfFrames);
//   console.log("editor:", tlEditor);
//   // console.log("multiUserWriters:", multiUserWriters);
//   console.log("currentPresentationPage:", currentPresentationPage);

//   console.log("currentUser:", currentUser);

//   // Create arrays to hold the assets and shapes
//   const assets = [];
//   const shapes = [];

//   // Extract user IDs from multiUserWriters
//   const userIds = Object.keys(multiUserWriters);

//   // Ensure we have enough users to distribute
//   if (userIds.length < usersPerFrame * numberOfFrames) {
//     console.error("Not enough users to distribute");
//     return;
//   }

//   // Calculate the position for the frames
//   const startX = currentPresentationPage?.scaledWidth || 0;
//   const startY = 0;
//   const frameWidth = currentPresentationPage?.scaledWidth;
//   const frameHeight = currentPresentationPage?.scaledHeight;

//   let userIndex = 0;

//   for (let i = 0; i < numberOfFrames; i++) {
//     const assignedTo = {};

//     for (let j = 0; j < usersPerFrame; j++) {
//       const userId = userIds[userIndex];
//       assignedTo[userId] = true;
//       userIndex++;
//     }

//     // Calculate x position to place frames next to each other
//     const x = startX + frameWidth * i;
//     const y = startY;

//     // Create unique asset ID
//     const assetId = `asset:fr-${i}`;

//        // Create frame shape
//        const frameShape = {
//         id: `shape:br-frame${i}`,
//         type: "frame",
//         typeName: "shape",
//         x: x,
//         y: y,
//         rotation: 0,
//         isLocked: false,
//         opacity: 1,
//         parentId: `page:${currentPresentationPage?.num}`,
//         meta: {
//           assignedTo,
//           createdBy: currentUser.userId,
//         },
//         index: "a0",
//         props: {
//           h: frameHeight,
//           w: frameWidth,
//           name: Object.keys(assignedTo).join(", "),
//         },
//       };

//       shapes.push(frameShape);



//     // // Create image shape
//     const imageShape = {
//       id: `shape:framebgimage-${i}`,
//       index: 'a1',
//       isLocked: false,
//       meta: {
//         createdBy: "",
//       },
//       opacity: 1,
//       props: {
//         w: currentPresentationPage?.scaledWidth - 10,
//         h: currentPresentationPage?.scaledHeight - 10,
//         assetId: assetId, // Use a unique asset ID for each frame
//         playing: true,
//         url: "",
//         crop: null,
//       },
//       rotation: 0,
//       type: 'image',
//       parentId: `shape:br-frame${i}`,
//       typeName: 'shape',
//       x: 5,
//       y: 5,
//     };

//     shapes.push(imageShape);


//   }

//   // console.log('shapes being created : ', shapes);
//   // Add all shapes to the editor
//   tlEditor.createShapes(shapes);


  

//   this.handleModalClose();
// };


////////////////////////////



  handleButtonClick = () => {
    const { usersPerFrame, numberOfFrames } = this.state;
    const {
      tlEditor,
      multiUserWriters,
      multiUserSize,
      currentPresentationPage,
      currentUser,
    } = this.props;

    // Handle the values as needed
    console.log("Users per frame:", usersPerFrame);
    console.log("Number of frames:", numberOfFrames);
    console.log("editor:", tlEditor);
    console.log("multiUserWriters:", multiUserWriters);
    console.log("multiUserSize:", multiUserSize);
    console.log("currentPresentationPage:", currentPresentationPage);
    console.log("currentUser:", currentUser);

    // Create an array to hold the shapes
    const shapes = [];

    // Extract user IDs from multiUserWriters
    const userIds = Object.keys(multiUserWriters);

    // Ensure we have enough users to distribute
    if (userIds.length < usersPerFrame * numberOfFrames) {
      console.error("Not enough users to distribute");
      return;
    }

    // Calculate the position for the frames
    const startX = currentPresentationPage?.scaledWidth || 0;
    const startY = 0;
    const frameWidth = currentPresentationPage?.scaledWidth;
    const frameHeight = currentPresentationPage?.scaledHeight;

    let userIndex = 0;

    for (let i = 0; i < numberOfFrames; i++) {
      const assignedTo = {};

      for (let j = 0; j < usersPerFrame; j++) {
        const userId = userIds[userIndex];
        assignedTo[userId] = true;
        userIndex++;
      }

      // Calculate x position to place frames next to each other
      const x = startX + frameWidth * i;
      const y = startY;

      tlEditor.createShapes([
        {
          id: `shape:br-frame${i}`,
          type: "frame",
          typeName: "shape",
          x: x,
          y: y,
          rotation: 0,
          isLocked: false,
          opacity: 1,
          parentId: `page:${currentPresentationPage?.num}`,
          meta: {
            assignedTo,
            createdBy: currentUser?.userId,
          },
          index: "a1",
          props: {
            h: frameHeight,
            w: frameWidth,
            name: Object.keys(assignedTo).join(", "),
          },
        },
        {
          id: `shape:framebgimage-${i}`,
          index: 'a1',
          isLocked: false,
          meta: {
            createdBy: currentUser?.userId,
          },
          opacity: 1,
          props: {
            w: currentPresentationPage?.scaledWidth - 10,
            h: currentPresentationPage?.scaledHeight - 10,
            assetId: `asset:fr-${i}`,
            playing: true,
            url: "",
            crop: null,
          },
          rotation: 0,
          type: 'image',
          parentId: `shape:br-frame${i}`,
          typeName: 'shape',
          x: 5,
          y: 5,
        }
      ]);
    }

    // Close the modal
    this.handleModalClose();
  };

  renderModal() {
    const { showModal, usersPerFrame, numberOfFrames } = this.state;
    const { tlEditor, removeShapes } = this.props;

    return ReactDOM.createPortal(
      <styledComponents.Modal show={showModal}>
        <styledComponents.ModalContent>
          <styledComponents.ModalHeader>
            <styledComponents.ModalTitle>
              Breakout Settings
            </styledComponents.ModalTitle>
            <styledComponents.CloseButton onClick={this.handleModalClose}>
              &times;
            </styledComponents.CloseButton>
          </styledComponents.ModalHeader>
          <styledComponents.ModalBody>
            <styledComponents.Container>
              <styledComponents.FormGroup>
                <label htmlFor="usersPerFrame">Users per frame:</label>
                <input
                  type="number"
                  id="usersPerFrame"
                  name="usersPerFrame"
                  value={usersPerFrame}
                  onChange={this.handleInputChange}
                />
              </styledComponents.FormGroup>
              <styledComponents.FormGroup>
                <label htmlFor="numberOfFrames">Number of frames:</label>
                <input
                  type="number"
                  id="numberOfFrames"
                  name="numberOfFrames"
                  value={numberOfFrames}
                  onChange={this.handleInputChange}
                />
              </styledComponents.FormGroup>
              <styledComponents.SubmitButton onClick={this.handleButtonClick}>
                Start
              </styledComponents.SubmitButton>
              <styledComponents.SubmitButton
                onClick={() => {
                  const allRecords = tlEditor.store.allRecords();

                // Filter the objects that have type "frame" or "image" and IDs that start with "shape:br-frame" or "shape:framebgimage"
                  const filteredIds = allRecords
                  .filter(
                    (record) =>
                      (record.type === "frame") &&
                      (record.id.startsWith("shape:br-frame"))
                  )
                  .map((record) => record.id);

                  console.log("Filtered IDs:", filteredIds);



                  tlEditor.deleteShapes(filteredIds)

                }}
              >
                End
              </styledComponents.SubmitButton>
            </styledComponents.Container>
          </styledComponents.ModalBody>
        </styledComponents.ModalContent>
      </styledComponents.Modal>,
      document.body // Render the modal at the root level
    );
  }

  renderSkipSlideOpts(numberOfSlides) {
    // Fill drop down menu with all the slides in presentation
    const { intl } = this.props;
    const optionList = [];
    for (let i = 1; i <= numberOfSlides; i += 1) {
      optionList.push(
        <option value={i} key={i}>
          {intl.formatMessage(intlMessages.goToSlide, { 0: i })}
        </option>
      );
    }

    return optionList;
  }

  render() {
    const {
      currentSlideNum,
      numberOfSlides,
      fitToWidthHandler,
      fitToWidth,
      intl,
      zoom,
      isMeteorConnected,
      isPollingEnabled,
      amIPresenter,
      startPoll,
      currentSlide,
      slidePosition,
      multiUserSize,
      multiUser,
      setPresentationPageInfiniteCanvas,
      allowInfiniteCanvas,
      infiniteCanvasIcon,
    } = this.props;

    const { isMobile } = deviceInfo;

    const startOfSlides = !(currentSlideNum > 1);
    const endOfSlides = !(currentSlideNum < numberOfSlides);

    const prevSlideAriaLabel = startOfSlides
      ? intl.formatMessage(intlMessages.previousSlideLabel)
      : `${intl.formatMessage(intlMessages.previousSlideLabel)} (${
          currentSlideNum <= 1 ? "" : currentSlideNum - 1
        })`;

    const nextSlideAriaLabel = endOfSlides
      ? intl.formatMessage(intlMessages.nextSlideLabel)
      : `${intl.formatMessage(intlMessages.nextSlideLabel)} (${
          currentSlideNum >= 1 ? currentSlideNum + 1 : ""
        })`;

    const isInfiniteCanvas = currentSlide?.infiniteCanvas;


    console.log('allowInfiniteCanvas : ', currentSlide, allowInfiniteCanvas)

    return (
      <styledComponents.PresentationToolbarWrapper id="presentationToolbarWrapper">
        {this.renderAriaDescs()}
        <styledComponents.QuickPollButtonWrapper>
          {this.renderToolbarPluginItems()}
          {isPollingEnabled ? (
            <styledComponents.QuickPollButton
              {...{
                intl,
                amIPresenter,
                startPoll,
                currentSlide,
              }}
            />
          ) : null}

          <SmartMediaShareContainer {...{ intl, currentSlide }} />
        </styledComponents.QuickPollButtonWrapper>
        <styledComponents.PresentationSlideControls>
          <styledComponents.PrevSlideButton
            role="button"
            aria-label={prevSlideAriaLabel}
            aria-describedby={
              startOfSlides ? "noPrevSlideDesc" : "prevSlideDesc"
            }
            disabled={startOfSlides || !isMeteorConnected}
            color="light"
            circle
            icon="left_arrow"
            size="md"
            onClick={this.previousSlideHandler}
            label={intl.formatMessage(intlMessages.previousSlideLabel)}
            hideLabel
            data-test="prevSlide"
          />

          <TooltipContainer
            title={intl.formatMessage(intlMessages.selectLabel)}
          >
            <styledComponents.SkipSlideSelect
              id="skipSlide"
              aria-label={intl.formatMessage(intlMessages.skipSlideLabel)}
              aria-describedby="skipSlideDesc"
              aria-live="polite"
              aria-relevant="all"
              disabled={!isMeteorConnected}
              value={currentSlideNum}
              onChange={this.handleSkipToSlideChange}
              data-test="skipSlide"
            >
              {this.renderSkipSlideOpts(numberOfSlides)}
            </styledComponents.SkipSlideSelect>
          </TooltipContainer>
          <styledComponents.NextSlideButton
            role="button"
            aria-label={nextSlideAriaLabel}
            aria-describedby={endOfSlides ? "noNextSlideDesc" : "nextSlideDesc"}
            disabled={endOfSlides || !isMeteorConnected}
            color="light"
            circle
            icon="right_arrow"
            size="md"
            onClick={this.nextSlideHandler}
            label={intl.formatMessage(intlMessages.nextSlideLabel)}
            hideLabel
            data-test="nextSlide"
          />
        </styledComponents.PresentationSlideControls>
        <styledComponents.PresentationZoomControls>
          {this.renderModal()}
          <button onClick={this.handleModalShow}>Settings</button>
          {allowInfiniteCanvas && (
            <styledComponents.InfiniteCanvasButton
              data-test={
                isInfiniteCanvas
                  ? "turnInfiniteCanvasOff"
                  : "turnInfiniteCanvasOn"
              }
              role="button"
              aria-label={
                isInfiniteCanvas
                  ? intl.formatMessage(intlMessages.infiniteCanvasOff)
                  : intl.formatMessage(intlMessages.infiniteCanvasOn)
              }
              color="light"
              disabled={!isMeteorConnected}
              customIcon={infiniteCanvasIcon(isInfiniteCanvas)}
              size="md"
              circle
              onClick={() => {
                setPresentationPageInfiniteCanvas(!isInfiniteCanvas);
              }}
              label={
                isInfiniteCanvas
                  ? intl.formatMessage(intlMessages.infiniteCanvasOff)
                  : intl.formatMessage(intlMessages.infiniteCanvasOn)
              }
              hideLabel
            />
          )}

          <styledComponents.WBAccessButton
            data-test={
              multiUser
                ? "turnMultiUsersWhiteboardOff"
                : "turnMultiUsersWhiteboardOn"
            }
            role="button"
            aria-label={
              multiUser
                ? intl.formatMessage(intlMessages.toolbarMultiUserOff)
                : intl.formatMessage(intlMessages.toolbarMultiUserOn)
            }
            color="light"
            disabled={!isMeteorConnected}
            icon={multiUser ? "multi_whiteboard" : "whiteboard"}
            size="md"
            circle
            onClick={() => this.handleSwitchWhiteboardMode(!multiUser)}
            label={
              multiUser
                ? intl.formatMessage(intlMessages.toolbarMultiUserOff)
                : intl.formatMessage(intlMessages.toolbarMultiUserOn)
            }
            hideLabel
          />
          {multiUser ? (
            <styledComponents.MultiUserTool
              onClick={() => this.handleSwitchWhiteboardMode(!multiUser)}
            >
              {multiUserSize}
            </styledComponents.MultiUserTool>
          ) : (
            <styledComponents.MUTPlaceholder />
          )}
          {!isMobile ? (
            <TooltipContainer>
              <ZoomTool
                slidePosition={slidePosition}
                zoomValue={zoom}
                currentSlideNum={currentSlideNum}
                change={this.change}
                minBound={HUNDRED_PERCENT}
                maxBound={MAX_PERCENT}
                step={STEP}
                isInfiniteCanvas={isInfiniteCanvas}
                isMeteorConnected={isMeteorConnected}
              />
            </TooltipContainer>
          ) : null}
          <styledComponents.FitToWidthButton
            role="button"
            data-test="fitToWidthButton"
            aria-describedby={fitToWidth ? "fitPageDesc" : "fitWidthDesc"}
            aria-label={
              fitToWidth
                ? `${intl.formatMessage(
                    intlMessages.presentationLabel
                  )} ${intl.formatMessage(intlMessages.fitToPage)}`
                : `${intl.formatMessage(
                    intlMessages.presentationLabel
                  )} ${intl.formatMessage(intlMessages.fitToWidth)}`
            }
            color="light"
            disabled={!isMeteorConnected}
            icon="fit_to_width"
            size="md"
            circle
            onClick={fitToWidthHandler}
            label={
              fitToWidth
                ? intl.formatMessage(intlMessages.fitToPage)
                : intl.formatMessage(intlMessages.fitToWidth)
            }
            hideLabel
            $fitToWidth={fitToWidth}
          />
        </styledComponents.PresentationZoomControls>
      </styledComponents.PresentationToolbarWrapper>
    );
  }
}

PresentationToolbar.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,
  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,
  // Actions required for the presenter toolbar
  nextSlide: PropTypes.func.isRequired,
  previousSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  zoomChanger: PropTypes.func.isRequired,
  fitToWidthHandler: PropTypes.func.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
  zoom: PropTypes.number.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  fullscreenAction: PropTypes.string.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  setIsPanning: PropTypes.func.isRequired,
  multiUser: PropTypes.bool.isRequired,
  whiteboardId: PropTypes.string.isRequired,
  removeWhiteboardGlobalAccess: PropTypes.func.isRequired,
  addWhiteboardGlobalAccess: PropTypes.func.isRequired,
  fullscreenRef: PropTypes.instanceOf(Element),
  handleToggleFullScreen: PropTypes.func.isRequired,
  isPollingEnabled: PropTypes.bool.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  startPoll: PropTypes.func.isRequired,
  currentSlide: PropTypes.shape().isRequired,
  slidePosition: PropTypes.shape().isRequired,
  multiUserSize: PropTypes.number.isRequired,
};

PresentationToolbar.defaultProps = {
  fullscreenRef: null,
};

export default injectWbResizeEvent(injectIntl(PresentationToolbar));
