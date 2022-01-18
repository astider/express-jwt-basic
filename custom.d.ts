declare namespace Express {
  interface Request {
    user?: {
      id: number,
      name: string,
      age: number,
      username: string,
    };
  }
}