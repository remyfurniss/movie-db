import prisma from "../../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../../lib/jwt";

export async function registerUser(email: string, password: string) {
    //See if email already registered
    const existing = await prisma.user.findUnique({
        where: { email },
    });
    if (existing) throw new Error("User already exists");
    //Hash password
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashed },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
    });
    return { token };
}

export async function loginUser(email: string, password: string) {
    //See if email already registered
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) throw new Error("User not found");
    //Check password match
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
    });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}