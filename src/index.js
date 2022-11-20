import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import joi from "joi";
import { v4 as uuidV4} from "uuid";

const userSchema = joi.object({
  nome: joi.string().required().min(3).max(100),
  email: joi.string().email().required(),
  senha: joi.string().required(),
});

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

const db = mongoClient.db("projeto14");
const userCollection = db.collection("users");

app.post("/sign-up", async (req, res) => {
  const user = req.body;

  try {
    const userExists = await userCollection.findOne({ email: user.email });
    if (userExists) {
      return res.status(409).send({ message: "conta já cadastrada" });
    }

    const { error } = userSchema.validate(user, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).send(errors);
    }

    const hashPassword = bcrypt.hashSync(user.senha, 10);

    await userCollection.insertOne({ ...user, senha: hashPassword });
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, senha } = req.body;

  const token = uuidV4()

  try {
    const userExists = await userCollection.findOne({ email });
    if (!userExists) {
      return res.sendStatus(401);
    }
    
    const senhaOk = bcrypt.compareSync(senha, userExists.senha);
    
    if (!senhaOk) {
        return res.sendStatus(401);
    }

    const userSession = await db.collection('sessions').findOne({ userId: userExists._id});

    if (userSession) {
        return res.status(401).send({ message: 'vc ja ta logado, relogue' })
    }

    await db.collection('sessions').insertOne({ 
        token,
        userId: userExists._id,
    })

    res.send({ token });

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(4000, () => {
  console.log("server rodando na porta 4000");
});
