import { base, Record, Records, Table } from "airtable";

export type PointsRecord = {
  chat_id: number;
  user_id: number;
  points: number;
};

export class PointsTable {
  private constructor(private readonly table: Table<PointsRecord>) {}

  static create() {
    const table = base("app3AKqySx0bYlNue");
    return new PointsTable(table<PointsRecord>("points"));
  }

  async assignPointsToUser(
    chatId: number,
    userId: number,
    points: number
  ): Promise<Record<PointsRecord>> {
    const record = await this.getPointsRecordForUser(chatId, userId);
    const newPoints = record.get("points") + points;
    record.set("points", newPoints);
    return record.save();
  }

  async getPointsLeaderboard(chatId: number): Promise<Records<PointsRecord>> {
    return this.table
      .select({
        filterByFormula: `{chat_id} = ${chatId}`,
        sort: [{ field: "points", direction: "desc" }],
      })
      .firstPage();
  }

  async getPointsRecordForUser(
    chatId: number,
    userId: number,
    initialPoints: number = 0
  ): Promise<Record<PointsRecord>> {
    const [record] = await this.table
      .select({
        filterByFormula: `AND({chat_id} = ${chatId}, {user_id} = ${userId})`,
        pageSize: 1,
      })
      .firstPage();
    return record ?? this.createPointsRecord(chatId, userId, initialPoints);
  }

  async createPointsRecord(
    chatId: number,
    userId: number,
    initialPoints: number
  ): Promise<Record<PointsRecord>> {
    const [record] = await this.table.create([
      {
        fields: {
          chat_id: chatId,
          user_id: userId,
          points: initialPoints,
        },
      },
    ]);

    return record;
  }
}
