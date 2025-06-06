import express from "express";
import { register, login } from "../data/authData";
import { check_string } from "../validation";

const router = express.Router();

router.post("/register", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        check_string(email);
        check_string(password);
        const result = await register(email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        check_string(email);
        check_string(password);
        const result = await login(email, password);
        // Set refresh token as HttpOnly cookie
        res.cookie("refreshToken", result.refreshToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: "strict"
        });
        res.json({ accessToken: result.accessToken, user: result.user });
    } catch (error) {
        next(error);
    }
});

export default router;
