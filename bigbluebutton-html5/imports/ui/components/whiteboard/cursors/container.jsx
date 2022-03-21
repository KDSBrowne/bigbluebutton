import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import Auth from "/imports/ui/services/auth";
import Cursors from "./component";
import Service from "../service";

const CursorsContainer = (props) => {
    console.log('CursorsContainer ', props)

    return <Cursors {...props} publishCursorUpdate={props.publishCursorUpdate}/>
};

export default withTracker(({ currentUser, publishCursorUpdate }) => {
    console.log('IN TRACKER ', publishCursorUpdate)
  return { 
    currentUser,
    publishCursorUpdate,
  };
})(CursorsContainer);
