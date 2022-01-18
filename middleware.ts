import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: any;
}

const checkAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) res.status(401).send({ error: 'unauthorized' });
  try {
    const user = jwt.verify(token as string, 'superSecret');
    req.user = user;
    next();
  } catch (e: any) {
    res.send({
      error: e.toString(),
    })
  }
};

export default checkAuth;