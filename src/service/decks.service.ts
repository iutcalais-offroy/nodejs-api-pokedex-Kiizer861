import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database"; // ton client Prisma
import { env } from "../env";

export const authService = {
  async signUp(email: string, username: string, password: string) {
    // Vérifie si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already used");
      (error as any).status = 409;
      throw error;
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crée l'utilisateur
    const newUser = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    // Génère le token JWT
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
    // Cherche l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error("Invalid credentials");
      (error as any).status = 401;
      throw error;
    }

    // Compare le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const error = new Error("Invalid credentials");
      (error as any).status = 401;
      throw error;
    }

    // Génère le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    };
  },
};
