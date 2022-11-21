import joi from "joi";
import { db, sessionsCollection, transactionsCollection, userCollection } from "../index.js";
import dayjs from "dayjs";

const depositSchema = joi.object({
  valor: joi.number().required(),
  descricao: joi.string().required().max(20),
});

const dayMonth = dayjs().format('DD/MM')


export async function postDepositWallet(req, res) {
  const { valor, descricao } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    
    const userToken = await sessionsCollection.findOne({ token: token });
    
    const user = await userCollection.findOne({_id: userToken?.userId})
    if (!user) {
      return res.sendStatus(401);
    }
    const deposit = {
            userId: user._id,
            valor,
            descricao,
            tipo: "deposit",
            data: dayMonth,
        }
    const {error} = depositSchema.validate(deposit, {abortEarly: false});
    
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).send(errors);
      }
    
    await transactionsCollection.insertOne(
        deposit
    )
    res.sendStatus(201)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
}

export async function postDrawWallet(req, res) {
    const { valor, descricao } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    
  
  
    if (!token) {
      return res.sendStatus(401);
    }
  
    try {
      
      const userToken = await sessionsCollection.findOne({ token: token });
      
      const user = await userCollection.findOne({_id: userToken.userId})
      if (!user) {
        return res.sendStatus(401);
      }
      const deposit = {
              userId: user._id,
              valor,
              descricao,
              tipo: "saque",
              data: dayMonth,
          }
      const {error} = depositSchema.validate(deposit, {abortEarly: false});
      
      if (error) {
          const errors = error.details.map((detail) => detail.message);
          return res.status(400).send(errors);
        }
      
      await transactionsCollection.insertOne(
          deposit
      )
      res.sendStatus(201)
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }
  
export async function getWallet(req, res ) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.sendStatus(401);
    }

    try {
        const userToken = await sessionsCollection.findOne({ token: token });
      
        const user = await userCollection.findOne({_id: userToken?.userId})
        if (!user) {
          return res.sendStatus(401);
        }

        const userMoves = await transactionsCollection.find({userId: user._id}).toArray()

        res.send(userMoves)
    } catch(err) {
        console.log(err)
    }
}