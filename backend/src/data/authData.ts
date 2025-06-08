import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { check_string } from "../validation";

export const register = async (username: string, password: string) => {
  check_string(username);
  check_string(password);

  const existing_user = await User.findOne({ username });
  if (existing_user) {
    throw new Error("User already exists");
  }

  const hashed_password = await bcrypt.hash(password, 10);
  const new_user = new User({
    username,
    password: hashed_password,
    role: "user",
  });

  await new_user.save();
  return { message: "User registered successfully" };
};

export const login = async (username: string, password: string) => {
  check_string(username);
  check_string(password);

  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("User does not exist");
  }

  const password_match = await bcrypt.compare(password, user.password);
  if (!password_match) {
    throw new Error("Incorrect password");
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets not configured properly");
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};
