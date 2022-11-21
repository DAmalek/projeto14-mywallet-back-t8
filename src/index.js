import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import joi from "joi";
import { v4 as uuidV4} from "uuid";
import { signIn, signUp } from "./controllers/usersController.js";
import { postDepositWallet } from "./controllers/walletControllers.js";
import { postDrawWallet } from "./controllers/walletControllers.js";
import { getWallet } from "./controllers/walletControllers.js";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
} catch (err) {
  console.log(err);
}

export const db = mongoClient.db("projeto14");
export const userCollection = db.collection("users");
export const transactionsCollection = db.collection("transactions");
export const sessionsCollection = db.collection("sessions");

app.post("/sign-up", signUp)
app.post("/sign-in", signIn)
app.post("/deposit", postDepositWallet)
app.post("/draw", postDrawWallet)
app.get("/wallet", getWallet)

app.listen(4000, () => {
  console.log("server rodando na porta 4000");
});
