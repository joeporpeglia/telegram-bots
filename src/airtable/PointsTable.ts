import { base, Record, Records } from "airtable";

export type PointsRecord = {
  chat_id: number;
  user_id: number;
  points: number;
};

const table = base("app3AKqySx0bYlNue");
const pointsTable = table<PointsRecord>("points");

export async function assignPointsToUser(
  chatId: number,
  userId: number,
  points: number
): Promise<Record<PointsRecord>> {
  const record = await getPointsRecordForUser(chatId, userId);
  const newPoints = record.get("points") + points;
  record.set("points", newPoints);
  return record.save();
}

export async function getPointsLeaderboard(
  chatId: number
): Promise<Records<PointsRecord>> {
  return pointsTable
    .select({
      filterByFormula: `{chat_id} = ${chatId}`,
      sort: [{ field: "points", direction: "desc" }],
    })
    .firstPage();
}

export async function getPointsRecordForUser(
  chatId: number,
  userId: number,
  initialPoints: number = 0
): Promise<Record<PointsRecord>> {
  const [record] = await pointsTable
    .select({
      filterByFormula: `AND({chat_id} = ${chatId}, {user_id} = ${userId})`,
      pageSize: 1,
    })
    .firstPage();
  return record ?? createPointsRecord(chatId, userId, initialPoints);
}

export async function createPointsRecord(
  chatId: number,
  userId: number,
  initialPoints: number
): Promise<Record<PointsRecord>> {
  const [record] = await pointsTable.create([
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
