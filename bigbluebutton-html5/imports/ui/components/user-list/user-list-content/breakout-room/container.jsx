import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { toggleBreakoutRoomPanel } from '/imports/ui/services/panel-manager';
import BreakoutRoomItem from './component';

const BreakoutRoomItemContainer = props => <BreakoutRoomItem {...props} />;

export default withTracker(({ }) => ({
  toggleBreakoutRoomPanel: () => toggleBreakoutRoomPanel(),
}))(BreakoutRoomItemContainer);
