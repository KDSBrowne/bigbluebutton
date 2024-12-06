import styled, { createGlobalStyle } from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const TldrawV2GlobalStyle = createGlobalStyle`
  ${({ isPresenter, hasWBAccess }) => (!isPresenter && hasWBAccess) && `
    [data-testid="tools.hand"] {
      display: none !important;
    }
  `}

  ${({ isMultiUserActive, isInWhiteboardVision }) => (!isMultiUserActive) && `
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
    overflow: hidden;
  }

  #whiteboard-element > * {
    position: absolute; 
    height: 100%;
  }

  #whiteboard-element .tl-overlays {
    left: 0px;
    bottom: 0px;
  }

  .tlui-debug-panel {
    display: none;
  }

    ${({ bgSelected }) => (bgSelected) && `
      [data-testid="menu-item.toggle-lock"],
      [data-testid="menu-item.toggle-locked"],
      [data-testid="menu-item.paste"],
      [data-testid="menu-item.copy"] {
        display: none !important;
      }
  `}
  [data-testid="menu-item.bring-to-front"],
  [data-testid="menu-item.bring-forward"],
  [data-testid="menu-item.send-backward"],
  [data-testid="menu-item.send-to-back"],
  [data-testid="menu-item.modify"],
  [data-testid="menu-item.conversions"],
  .tlui-helper-buttons,
  [data-testid="main.page-menu"],
  [data-testid="main.menu"],
  [data-testid="tools.more.laser"],
  [data-testid="tools.asset"],
  [data-testid="page-menu.button"],
  [data-testid="menu-item.zoom-to-100"],
  .tlui-menu-zone {
    display: none !important;
  }
  .tl-collaborator__cursor {
    height: auto !important;
    width: auto !important;
  }

    .tl-overlays__item {
    height: auto !important;
    width: auto !important;
  }
  .tlui-popover__content {
    left: -50px !important;
  }
  ${({ isPresenter, isMultiUserActive }) => !isPresenter && !isMultiUserActive && `
    .tl-cursor use {
      transform: scale(0.05)!important;
    }
    .tl-collaborator__cursor {
      position: absolute !important;
      left: -7px !important;
      top: -6px !important;
    }
  `}

    .tl-container:focus-within {
    outline: none !important;
  }

`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

const PanelWrapper = styled.div`
  position: fixed; /* Overlay the whiteboard */
  top: 0;
  left: 0;
  height: 100%;
  width: 200px;
  background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
  display: flex;
  flex-direction: column;
  z-index: 1100; /* Ensure it is above the whiteboard */
  border-right: 1px solid #ccc; /* Border to define the edge */

  /* Slide In/Out Effect */
  transform: ${({ isVisible }) => (isVisible ? "translateX(0)" : "translateX(-100%)")};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
`;



const PanelContainer = styled(ScrollboxVertical)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;







const PanelBox = styled.div`
  position: relative;
  height: 100px;
  flex-shrink: 0;
  border: 2px solid
    ${({ isPushed, isSelected, isFocused }) =>
      isPushed
        ? "#28A745" // Green for shared (highest precedence)
        : isSelected
        ? "#007BFF" // Blue for selected (second precedence)
        : isFocused
        ? "#6C757D" // Dark gray for focused (third precedence)
        : "transparent"}; // No border by default
  background-color: ${({ isPushed, isSelected, isFocused }) =>
    isPushed
      ? "#E6F7E6" // Light green for shared (highest precedence)
      : isSelected
      ? "#E6F0FF" // Light blue for selected (second precedence)
      : isFocused
      ? "#F0F0F0" // Light gray for focused (third precedence)
      : "#fff"}; // Default white background
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  transition: border 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;

  // Add drop shadow
  box-shadow: ${({ isPushed, isSelected, isFocused }) =>
    isPushed
      ? "0px 4px 8px rgba(40, 167, 69, 0.4)" // Green shadow for shared
      : isSelected
      ? "0px 4px 8px rgba(0, 123, 255, 0.4)" // Blue shadow for selected
      : isFocused
      ? "0px 4px 8px rgba(108, 117, 125, 0.4)" // Gray shadow for focused
      : "0px 2px 4px rgba(0, 0, 0, 0.1)"}; // Subtle default shadow

  &:hover {
    background-color: ${({ isPushed, isSelected, isFocused }) =>
      isPushed
        ? "#D4E9D4" // Darker green on hover
        : isSelected
        ? "#D4E2FF" // Darker blue on hover
        : isFocused
        ? "#E0E0E0" // Darker gray on hover
        : "#f7f7f7"}; // Light gray on hover
    box-shadow: ${({ isPushed, isSelected, isFocused }) =>
      isPushed
        ? "0px 6px 12px rgba(40, 167, 69, 0.5)" // Larger green shadow on hover
        : isSelected
        ? "0px 6px 12px rgba(0, 123, 255, 0.5)" // Larger blue shadow on hover
        : isFocused
        ? "0px 6px 12px rgba(108, 117, 125, 0.5)" // Larger gray shadow on hover
        : "0px 4px 8px rgba(0, 0, 0, 0.2)"}; // Larger default shadow on hover
  }
`;





const Header = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ isShared }) =>
    isShared ? "rgba(40, 167, 69, 1)" : "rgba(0, 123, 255, 1)"};
  color: #ffffff;
  padding: ${({ isSearchVisible }) => (isSearchVisible ? "10px" : "5px 10px")};
  border-bottom: 1px solid ${({ isShared }) => (isShared ? "#28A745" : "#007BFF")};

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Push elements to edges */
    margin-bottom: ${({ isSearchVisible }) => (isSearchVisible ? "5px" : "0")};
  }

  .id-display {
    font-size: 12px;
    font-weight: normal; /* Remove bold styling */
  }

  .toggle-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%; /* Circular button */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2); /* Subtle hover effect */
    }

    svg {
      width: 14px;
      height: 14px; /* Smaller icon size */
    }
  }

  .search-row {
    margin-top: 8px;
    input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
    }
  }
`;









const SubText = styled.div`
  font-size: 12px;
  color: #d9e2ef;
  margin-top: 4px;
`;


const Footer = styled.div`
  position: sticky; /* Sticks to the bottom of the panel */
  bottom: 0;
  width: 100%;
  background-color: #f8f9fa; /* Light gray background */
  padding: 6px; /* Smaller padding */
  display: flex;
  justify-content: end; /* Space between buttons */
  align-items: center; /* Center buttons vertically */
  border-top: 1px solid #ddd; /* Subtle top border */
  z-index: 2; /* Ensure it appears above content */
  gap: 10px; /* Add some space between buttons */
`;





export default {
  Footer,
  PanelWrapper,
  SubText,
  Header,
  TldrawV2GlobalStyle,
  EditableWBWrapper,
  PanelContainer,
  PanelBox,
};
