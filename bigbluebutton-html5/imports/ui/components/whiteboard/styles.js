import styled, { createGlobalStyle } from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';

const TldrawV2GlobalStyle = createGlobalStyle`
  ${({ isPresenter, hasWBAccess }) => (!isPresenter && hasWBAccess) && `
    [data-testid="tools.hand"] {
      display: none !important;
    }
  `}

  ${({ isMultiUserActive, isInWhiteboardVision }) => (!isMultiUserActive || isInWhiteboardVision) && `
    .tl-nametag {
      display: none;
    }
  `}

  ${({ isToolbarVisible }) => (!isToolbarVisible) && `
    .tlui-toolbar,
    .tlui-style-panel__wrapper {
      visibility: hidden;
    }
    #WhiteboardOptionButton {
      opacity: 0.2;
    }
  `}

  #whiteboard-element {
    position: relative;
    height: 100%;
  }

  #whiteboard-element > * {
    position: relative; 
    height: 100%;
  }

  #whiteboard-element .tl-overlays {
    left: 0px;
    bottom: 0px;
  }

  .tlui-debug-panel {
    display: none;
  }

`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

const PanelContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 200px;
  background-color: rgba(255, 255, 255, 0.9);
  border-right: 2px solid #ccc;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto; /* Enable vertical scrolling */
  box-sizing: border-box;
  z-index: 1000;

  /* Fade In/Out Effect */
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease; /* Smooth visibility change */
`;


const PanelBox = styled.div`
  height: 100px;
  flex-shrink: 0;
  border: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
`;



export default {
  TldrawV2GlobalStyle,
  EditableWBWrapper,
  PanelContainer,
  PanelBox,
};
