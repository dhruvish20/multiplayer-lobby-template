import express, { Request, Response, NextFunction } from "express";
import authMiddleware from "../middleware/authmiddleware";
import { createOffice, joinOffice, leaveOffice } from "../data/officeData";
import { getOfficeSession } from "../data/roomManager";

interface RequestWithUser extends Request {
  user?: { id: string };
}

const router = express.Router();

// Create an office (Authenticated Route)
router.post("/create", authMiddleware, async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized: User ID not found" });
      return;
    }

    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Office name is required." });
      return;
    }

    const result = await createOffice(name, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Join an office (Authenticated Route)
router.post("/join", authMiddleware, async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized: User ID not found" });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Office code is required." });
      return;
    }

    const result = await joinOffice(code, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/leave", authMiddleware, async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized: User ID not found" });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Office code is required." });
      return;
    }

    const result = await leaveOffice(code, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:code", authMiddleware, async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ error: "Office code is required." });
      return;
    }

    const office = await getOfficeSession(code);
    if (!office) {
     res.status(404).json({ error: "Office not found or expired" });
     return;
    }

    res.status(200).json(office);
  } catch (error) {
    next(error);
  }
});

export default router;
