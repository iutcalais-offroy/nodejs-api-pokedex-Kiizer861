import { Request, Response } from "express";
import { authService, cardService } from "../service/decks.service"; //

export const authController = {
  
  async signUp(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;
      if (!email || !username || !password) {
        return res.status(400).json({ message: "Missing fields" });
      }
      const result = await authService.signUp(email, username, password);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(error.status || 500).json({ message: error.message || "Server error" });
    }
  },

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Missing fields" });
      }
      const result = await authService.signIn(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.status || 500).json({ message: error.message || "Server error" });
    }
  },

  getProfile: (req: Request, res: Response) => {
    res.json({ user: req.user });
  },

  async getAllCards(req: Request, res: Response) {
    try {
      const cards = await cardService.getAllCards();
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Server error" });
    }
  },
};