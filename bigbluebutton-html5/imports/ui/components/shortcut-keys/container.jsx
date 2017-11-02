import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ShortcutKeysComponent from './component';

const ShortcutKeysContainer = props => (
  <ShortcutKeysComponent {...props}>
    {props.children}
  </ShortcutKeysComponent>
);

const getClientBuildInfo = function () {
  return {
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    copyright: Meteor.settings.public.app.copyright,
  };
};

export default createContainer(() => getClientBuildInfo(), ShortcutKeysContainer);
