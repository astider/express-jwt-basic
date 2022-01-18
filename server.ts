import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt, { JwtPayload } from 'jsonwebtoken';
import checkAuth, { CustomRequest } from "./middleware";

const port = 3000;
const app = express();

type UserDB = {
  id: number,
  name: string,
  age: number,
  username: string,
  password: string,
}[];

app.use(bodyParser.json());

app.get('/', function (req, res) {
  const { name } = req.query;
  res.send(`Hello World ${name ?? ''}`);
});

app.post('/login', function (req, res) {
  const { username, password } = req.body as { [key: string]: any };
  if (!username || !password) res.status(400).send({ error: 'bad request' });
  const database = require('./users.json') as UserDB;
  const match = database.find((user) => user.username === username && user.password === password);
  if (!match) res.status(404).send({ error: 'not found' });
  const { password: matchedPassword, ...rest } = match as UserDB[number];
  const token = jwt.sign(rest, 'superSecret', { expiresIn: '60s' });
  res.send({ success: true, token });
});

app.get('/my-info', checkAuth, function (req: CustomRequest, res: Response) {
  const user = req.user;
  const name = user ? user.name : '';
  res.send(`Hello World ${name ?? ''}\n\n${JSON.stringify(user ?? {})}`);
});

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
