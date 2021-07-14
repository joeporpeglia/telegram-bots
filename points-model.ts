import * as firebase from "firebase-admin";

export type PointsAssigned = {
  type: "points-assigned";
  senderUserId: string;
  recipientUserId: string;
  messageId: string;
  pointsAmount: number;
};

export type Event = PointsAssigned;

type EventStore = {
  saveEvent(chatId: string, event: Event): Promise<void>;
  getEvents(chatId: string): Promise<Event[]>;
};

firebase.initializeApp({
  credential: firebase.credential.cert({
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.FIREBASE_PROJECT_ID,
  }),
});

const db = firebase.firestore();

export const EventStoreFirebase: EventStore = {
  async saveEvent(chatId, event) {
    await db.collection("chats").doc(chatId).collection("events").add({
      createdAt: new Date(),
      event,
    });
  },
  async getEvents(chatId) {
    const events = await db
      .collection("chats")
      .doc(chatId)
      .collection("events")
      .get();

    return events.docs.map((doc) => doc.data() as Event);
  },
};
