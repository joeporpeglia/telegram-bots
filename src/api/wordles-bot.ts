import { Telegram } from "telegraf";
import { NextApiRequest, NextApiResponse } from "next";

const telegram = new Telegram(process.env.WORLDES_BOT_TOKEN ?? "");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // send create command to chat
  // bot checks if there's an ongoing game
  // bot generates a distinct game name
  // bot sends inline keyboard with game name and buttons:
  // . - game creator sees "start" button
  //   - others see "join" button / "leave" button if they've already joined
  // game creator presses "start" button
  // bot DMs all members of game with grid of boxes and game name
  // user inputs guess
  // bot responds with updated grid and updated keyboard
  // when someone finishes their puzzle the bot automatically sends results to chat
};
