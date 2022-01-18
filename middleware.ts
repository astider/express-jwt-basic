import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: any;
}

const checkAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization'];
  if (!auth) res.status(401).send({ error: 'unauthorized' });
  const split = (auth as string).split(' ');
  if (split.length < 2) res.status(401).send({ error: 'unauthorized' });
  const token = split[1];
  try {
    const user = jwt.verify(token, 'superSecret');
    req.user = user;
    next();
  } catch (e: any) {
    res.send({
      error: e.toString(),
    })
  }
};

export default checkAuth;