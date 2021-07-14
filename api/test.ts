import { NowRequest, NowResponse } from "@now/node";
import { EventStoreFirebase } from "../points-model";

export default async (req: NowRequest, res: NowResponse) => {
  // await EventStoreFirebase.saveEvent("test-chat", {
  //   type: "points-assigned",
  //   messageId: "test-message",
  //   pointsAmount: 10,
  //   recipientUserId: "recipient-id",
  //   senderUserId: "sender-id",
  // });
  // res.send("OK");
};
