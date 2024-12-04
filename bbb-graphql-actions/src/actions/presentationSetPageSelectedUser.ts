import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
    [
      {name: 'selectedUser', type: 'string', required: true},
      {name: 'pageId', type: 'string', required: true},
    ]
  )

  const eventName = `SetPageSelectedUserPubMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as string,
    userId: sessionVariables['x-hasura-userid'] as string
  };

  const header = { 
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    pageId: input.pageId,
    selectedUser: input.selectedUser,
  };

  return { eventName, routing, header, body };
}