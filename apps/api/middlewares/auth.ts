import "dotenv/config";
import jwt from "jsonwebtoken";
import resolvers from "./../resolvers"

const SECRET_KEY = process.env.SECRET_KEY as string;

const authenticate = async (ctx: any, next: any) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    const user = await resolvers.user.getUserById(decoded.userId);
    if (!user || !token) {
      throw new Error('Usuário não encontrado');
    }
    ctx.user = user;
  } catch (err) {
    console.error(err);
  }

  await next();
};

export default { authenticate };
