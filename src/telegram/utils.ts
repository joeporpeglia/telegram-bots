import { Message, Update } from "telegraf/typings/core/types/typegram";

export function isTextMessage(
  message: Message | undefined
): message is Message.TextMessage {
  return message != null && "text" in message;
}

export function isMessageUpdate(
  update: Update | undefined
): update is Update.MessageUpdate {
  return update != null && "message" in update;
}
