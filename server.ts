import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import checkAuth, { CustomRequest } from "./middleware";
import * as fs from 'fs';

const port = 8888;
const app = express();

export type UserDB = {
  id: number,
  name: string,
  age: number,
  username: string,
  password: string,
}[];

const corsOptions = {
  origin: [
    /localhost(:\d+)?$/,
  ],
};

app.use(cors(corsOptions))
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({
    text: 'Hello',
  });
});

app.post('/login', function (req, res) {
  const { username, password } = req.body as { [key: string]: any };
  if (!username || !password) return res.status(400).send({ error: 'bad request' });
  const database = require('./users.json') as UserDB;
  const match = database.find((user) => user.username === username && user.password === password);
  if (!match) return res.status(404).send({ error: 'not found' });
  const { password: matchedPassword, ...rest } = match as UserDB[number];
  const token = jwt.sign(rest, 'superSecret', { expiresIn: '60s' });

  const theUser = match as UserDB[number];
  const tokenDatabase = require('./token.json') as { token: string, uid: number }[];
  
  const isUserExists = !!tokenDatabase.find(record => record.uid === theUser.id);
  const modifiedTokenList = isUserExists
    ? tokenDatabase.map((record) => {
      if (record.uid === theUser.id) return { ...record, token };
      return record;
    })
    : [...tokenDatabase, { uid: theUser.id, token }];
  fs.writeFileSync('token.json', JSON.stringify(modifiedTokenList));
  return res.send({ success: true, token });
});

app.get('/my-info', checkAuth, function (req: CustomRequest, res: Response) {
  const user = req.user;
  const name = user ? user.name : '';
  res.json({
    text: `Hellow ${name}`,
    info: user,
  });
});

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
