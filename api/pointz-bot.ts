import {
  assignPointsToUser,
  getPointsLeaderboard,
} from "../airtable/PointsTable";
import { Message, ChatMember } from "telegraf/typings/core/types/typegram";
import { Telegram } from "telegraf";
import { isMessageUpdate, isTextMessage } from "../telegram-util";
import { NowRequest, NowResponse } from "@now/node";
import { EventStoreFirebase } from "../points-model";

const telegram = new Telegram(process.env.POINTZ_BOT_TOKEN ?? "");

export default async (req: NowRequest, res: NowResponse) => {
  const body = req.body;

  if (!body || !isMessageUpdate(body) || !isTextMessage(body.message)) {
    return res.status(200).send("ok");
  }

  const message = body.message;

  if (!message.text.startsWith("@pointz_bot ")) {
    return res.status(200).send("ok");
  }

  if (shouldAssignPoints(message)) {
    await handleAssignPoints(message);
  } else if (shouldListPoints(message)) {
    await handleListPoints(message);
  }

  return res.status(200).send("ok");
};

function shouldAssignPoints(message: Message.TextMessage) {
  return (
    message.reply_to_message != null &&
    Number.isInteger(parsePointAmount(message.text ?? ""))
  );
}

function shouldListPoints(message: Message.TextMessage) {
  return (
    message.reply_to_message == null && message.text === "@pointz_bot list"
  );
}

async function handleAssignPoints(message: Message.TextMessage) {
  const sender = message.from;
  const recipient = message.reply_to_message?.from;
  const text = message.text ?? "";
  const amount = parsePointAmount(text) || 0;

  let response;

  if (sender?.id === recipient?.id && amount > 0) {
    response = `You can't give points to yourself lol`;
  } else if (Math.abs(amount) > 10) {
    response = "Nope!";
  } else if (
    Math.abs(amount) === 10 &&
    sender?.first_name.toLowerCase() === "shannon"
  ) {
    response = "Lol calm down Shannon";
  } else {
    await assignPointsToUser(message.chat.id, recipient?.id as number, amount);
    await EventStoreFirebase.saveEvent(message.chat.id + "", {
      type: "points-assigned",
      recipientUserId: recipient?.id + "",
      senderUserId: sender?.id + "",
      pointsAmount: amount,
      messageId: message.message_id + "",
    });
  }

  if (!response) {
    return;
  }

  await telegram.sendMessage(message.chat.id, response, {
    reply_to_message_id: message.message_id,
  });
}

async function handleListPoints(message: Message) {
  const leaderboard = await getPointsLeaderboard(message.chat.id);
  const leaderboardUsers = await Promise.all(
    leaderboard.map((r) =>
      telegram
        .getChatMember(r.get("chat_id"), r.get("user_id"))
        .catch(() => null)
    )
  );
  const response = leaderboardUsers
    .map((u, i) =>
      u
        ? `${leaderboardIcon(i)}: ${getDisplayName(u)} (${leaderboard[i].get(
            "points"
          )})`
        : null
    )
    .filter((row) => row !== null)
    .join("\n");

  await telegram.sendMessage(message.chat.id, response);
}

function leaderboardIcon(i: number) {
  switch (i) {
    case 0:
      return "🥇";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return "🙃";
  }
}

function parsePointAmount(text: string) {
  return parseInt(text.replace("@pointz_bot ", ""), 10);
}

function getDisplayName(member: ChatMember | null = null) {
  if (!member || !member.user) {
    return "Unknown";
  }

  return member.user.first_name;
}
