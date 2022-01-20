import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// // @ts-nocheck

// type Firestore = any;

// function initializeApp(x: any) {}
// function cert(x: any) {}
// function getFirestore(x: any): any {}

export type PointsAssigned = {
  type: "points-assigned";
  senderUserId: string;
  recipientUserId: string;
  messageId: string;
  pointsAmount: number;
};

export type CompetitionStarted = {
  type: "competition-started";
  senderUserId: string;
  competitionName: string;
};

export type CompetitionEnded = {
  type: "competition-ended";
  senderUserId: string;
  competitionName: string;
};

export type Event = PointsAssigned | CompetitionStarted | CompetitionEnded;

export type EventDocument = {
  event: Event;
  createdAt: Date;
};

type EventStore = {
  saveEvent(chatId: string, event: Event): Promise<void>;
  getEvents(chatId: string): Promise<Event[]>;
};

export class FirebaseEventStore implements EventStore {
  private constructor(private readonly db: Firestore) {}

  static async create() {
    const app = initializeApp({
      credential: cert({
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
    });

    const db = getFirestore(app);

    return new FirebaseEventStore(db);
  }

  async saveEvent(chatId: string, event: Event): Promise<void> {
    await this.db.collection("chats").doc(chatId).collection("events").add({
      createdAt: new Date(),
      event,
    });
  }
  async getEvents(chatId: string): Promise<Event[]> {
    const events = await this.db
      .collection("chats")
      .doc(chatId)
      .collection("events")
      .orderBy("createdAt", "asc")
      .get();

    return events.docs
      .map((doc) => doc.data() as EventDocument)
      .map((doc) => doc.event);
  }
}
