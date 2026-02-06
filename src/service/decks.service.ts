import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database"; //
import { env } from "../env"; //

export const authService = {
  
  async signUp(email: string, username: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already used");
      (error as any).status = 409;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return {
      token,
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    };
  },

  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error("Invalid credentials");
      (error as any).status = 401;
      throw error;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const error = new Error("Invalid credentials");
      (error as any).status = 401;
      throw error;
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    };
  },
};


export const cardService = {
  async getAllCards() {
    return await prisma.card.findMany({
      orderBy: {
        pokedexNumber: "asc", 
      },
    });
  },
};