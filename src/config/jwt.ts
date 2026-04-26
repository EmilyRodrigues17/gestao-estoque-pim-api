import dotenv from "dotenv";
dotenv.config();

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

export const JWT_REFRESH_EXPIRES_IN_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 7;