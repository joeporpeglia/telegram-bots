import FormData from "form-data";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { isMessageUpdate, isTextMessage } from "../telegram-util";
import { Telegram } from "telegraf";

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

const telegram = new Telegram(process.env.SPONGEBOBMOCK_BOT_TOKEN ?? "");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;

  if (!body || !isMessageUpdate(body) || !isTextMessage(body.message)) {
    return res.status(200).send("ok");
  }

  const message = body.message;

  if (
    message.text !== "@spongebobmock_bot" ||
    !isTextMessage(message.reply_to_message)
  ) {
    return res.status(200).send("ok");
  }

  const parent = message.reply_to_message;

  const form = new FormData();
  form.append("template_id", "102156234");
  form.append("username", process.env.IMGFLIP_USERNAME as string);
  form.append("password", process.env.IMGFLIP_PASSWORD as string);
  form.append("boxes[0][text]", spongebobCase(parent.text));

  const fetchResponse = await fetch("https://api.imgflip.com/caption_image", {
    method: "POST",
    body: form,
  });

  const response = (await fetchResponse.json()) as ImgFlipResponse;

  if (response.success) {
    await telegram.sendPhoto(message.chat.id, response.data.url, {
      reply_to_message_id: parent.message_id,
    });
  }

  return res.status(200).send("ok");
};

function spongebobCase(text: string) {
  const bobbed = [];

  for (let char of text) {
    bobbed.push(Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase());
  }

  return bobbed.join("");
}
