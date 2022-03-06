import { withTracker } from "meteor/react-meteor-data";
import Service from "./service";
import Whiteboard from "./component";
import React, { useContext } from "react";
import { UsersContext } from "../components-data/users-context/context";
import Auth from "/imports/ui/services/auth";

const WhiteboardContainer = (props) => {
    const usingUsersContext = useContext(UsersContext);
    const { users } = usingUsersContext;
    const currentUser = users[Auth.meetingID][Auth.userID];
    const isPresenter = currentUser.presenter;
    return <Whiteboard {...{isPresenter}} {...props} />
};

export default withTracker(({}) => {
  return { 
    initDefaultPages: Service.initDefaultPages,
  };
})(WhiteboardContainer);
