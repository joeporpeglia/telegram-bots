import { NowRequest, NowResponse } from "@now/node";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { Update, User } from "telegraf/typings/core/types/typegram";

export type SendMessageResponse = {
  method: "sendMessage";
  chat_id: number;
  reply_to_message_id?: number;
  text: string;
};

export type SendPhotoResponse = {
  method: "sendPhoto";
  chat_id: number;
  reply_to_message_id?: number;
  photo: string;
};

export type WebhookResponse = SendMessageResponse | SendPhotoResponse;

export type Webhook = (
  update: Update.MessageUpdate
) => Promise<WebhookResponse | null>;

export function createWebhook(handleUpdate: Webhook) {
  return async (req: NowRequest, res: NowResponse) => {
    const maybeUpdate = req.body;

    if (!maybeUpdate || !maybeUpdate.message) {
      res.status(200).send("ok");
      return;
    }

    const update: Update.MessageUpdate = maybeUpdate;

    let response;

    try {
      response = await handleUpdate(update);
    } catch (err) {
      console.error("Failed to handle update", err, update);
    }

    // Return any response to telegram since they may include actions.
    if (response) {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(response));
      return;
    }

    res.status(200).send("");
  };
}

export async function getUser(
  chatId: number,
  userId: number
): Promise<User | null> {
  const params = new URLSearchParams();
  params.set("chat_id", String(chatId));
  params.set("user_id", String(userId));
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.POINTZ_BOT_TOKEN}/getChatMember?${params}`
  );
  const { result, ok, description } = await response.json();

  if (!ok) {
    console.error(description);
    return null;
  }

  return result.user;
}
