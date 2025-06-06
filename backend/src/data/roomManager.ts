// roomManager.ts
import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

export const createOfficeSession = async (officeData: any) => {
  const key = `office:${officeData.code}`;
  await redis.set(key, JSON.stringify(officeData), "EX", 3600);
  return officeData;
};

export const getOfficeSession = async (code: string) => {
  const data = await redis.get(`office:${code}`);
  return data ? JSON.parse(data) : null;
};

export const joinOfficeSession = async (code: string, userId: string) => {
  const office = await getOfficeSession(code);
  if (!office) throw new Error("Office not found or expired");
  if (!office.users.includes(userId)) {
    office.users.push(userId);
    await redis.set(`office:${code}`, JSON.stringify(office), "EX", 3600);
  }
  return office;
};
