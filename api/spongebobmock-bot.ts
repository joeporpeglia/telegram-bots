import fetch from "node-fetch";
import FormData from "form-data";
import { createWebhook } from "../telegram/TelegramApi";
import { Message } from "telegraf/typings/core/types/typegram";

type ImgFlipCaptionSuccess = {
  success: true;
  data: {
    url: string;
    page_url: string;
  };
};

type ImgFlipCaptionFailure = {
  success: false;
  error_message: string;
};

type ImgFlipResponse = ImgFlipCaptionFailure | ImgFlipCaptionSuccess;

export default createWebhook(async (update) => {
  const message = update.message as Message.TextMessage;

  if (!message.text) {
    return null;
  }

  const parent = message.reply_to_message as Message.TextMessage;

  // Ignore everything except mentions as replies
  if (message.text !== "@spongebobmock_bot" || !parent || !parent.text) {
    return null;
  }

  const form = new FormData();
  form.append("template_id", "102156234");
  form.append("username", process.env.IMGFLIP_USERNAME as string);
  form.append("password", process.env.IMGFLIP_PASSWORD as string);
  form.append("boxes[0][text]", spongebobCase(parent.text));

  const fetchResponse = await fetch("https://api.imgflip.com/caption_image", {
    method: "POST",
    body: form,
  });

  const response: ImgFlipResponse = await fetchResponse.json();

  if (!response.success) {
    console.error(response);
    return null;
  }

  return {
    chat_id: message.chat.id,
    method: "sendPhoto",
    reply_to_message_id: message.reply_to_message?.message_id,
    photo: response.data.url,
  };
});

function spongebobCase(text: string) {
  const bobbed = [];

  for (let char of text) {
    bobbed.push(Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase());
  }

  return bobbed.join("");
}
