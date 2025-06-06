import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Office from "../models/Office";
import Redis from "ioredis";

const redis = new Redis();
export const createOffice = async (name: string, userId: string) => {
    // Convert userId string to ObjectId if necessary
    const officeCode = uuidv4();
    
    const officeKey = `office:${officeCode}`;
    await redis.hset(officeKey, {
        code: officeCode,
        name,
        admin: userId,
    })

    await redis.sadd(`${officeKey}:users`, userId);

    await redis.expire(officeKey, 3600);
    await redis.expire(`${officeKey}:users`, 3600);

    return { code: officeCode, name, admin: userId, users: [userId] };
};

export const joinOffice = async (code: string, userId: string) => {
    const officeKey = `office:${code}`;
    const exists = await redis.exists(officeKey);

    if(!exists) {
        throw new Error("Office not found or expired");
    }

    await redis.sadd(`${officeKey}:users`, userId);
    await redis.expire(`${officeKey}:users`, 3600);
    await redis.expire(officeKey, 3600);

    const users = await redis.smembers(`${officeKey}:users`);

    return {code, name: await redis.hget(officeKey, "name"), admin: await redis.hget(officeKey, "admin"), users};
};

export const leaveOffice = async (code: string, userId: string) => {
    const officeKey = `office:${code}`;
    const exists = await redis.exists(officeKey);

    if(!exists) {
        throw new Error("Office not found or expired");
    }

    await redis.srem(`${officeKey}:users`, userId);
    
    const remainingUsers = await redis.scard(`${officeKey}:users`);
    if(remainingUsers === 0) {
        await redis.del(officeKey, `${officeKey}:users`);
    }

    return { message: "User left the office" };
}