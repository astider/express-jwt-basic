import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import * as fs from 'fs';
import { UserDB } from "./server";

export interface CustomRequest extends Request {
  user?: any;
}

const checkAuth = (req: CustomRequest, res: Response, next: NextFunction) => {;
  const auth = req.headers['authorization'] as string;
  console.log('auth', auth);
  if (!auth) return res.status(401).send({ error: 'unauthorized' });
  const split = (auth ?? '').split(' ');
  if (split.length < 2) return res.status(401).send({ error: 'unauthorized' });
  const token = split[1];
  // const tokenDatabase = require('./token.json') as { token: string, uid: number }[];
  const tokenDatabase = JSON.parse(fs.readFileSync('./token.json').toString()) as { token: string, uid: number }[];
  // console.log('token db', tokenDatabase);
  const match = tokenDatabase.find((record) => {
    // console.log(`compare [${token}] and [${record.token}]`);
    return record.token === token;
  });
  // console.log('\nmatch?', match);
  // console.log('match?', !match);
  if (!match) return res.status(404).send({ error: 'token not found' });
  const theRecord = match as { token: string, uid: number };
  const userDatabase = require('./users.json') as UserDB;
  const matchUser = userDatabase.find((user) => user.id === theRecord.uid);
  if (!matchUser) return res.status(404).send({ error: 'user not found' });

  try {
    const user = jwt.verify(token, 'superSecret');
    req.user = matchUser;
    next();
  } catch (e: any) {
    res.status(401).send({
      error: e.toString(),
    })
  }
};

export default checkAuth;