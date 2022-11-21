import { db, sessionsCollection, userCollection } from "../index.js";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import joi from "joi";


const userSchema = joi.object({
    nome: joi.string().required().min(3).max(100),
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

export async function signUp(req, res) {
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
}

export async function signIn(req, res) {
  const { email, senha } = req.body;

  const token = uuidV4();

  try {
    const userExists = await userCollection.findOne({ email });
    if (!userExists) {
      return res.sendStatus(401);
    }
    const nome = userExists.nome
    const senhaOk = bcrypt.compareSync(senha, userExists.senha);

    if (!senhaOk) {
      return res.sendStatus(401);
    }

    const userSession = await sessionsCollection
      .findOne({ userId: userExists._id });

    if (userSession) {
      await sessionsCollection.deleteOne({userId: userExists._id});
    }

    await sessionsCollection.insertOne({
      token,
      userId: userExists._id,
    });
    
    const userObj = { token, nome }

    res.send(userObj);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
