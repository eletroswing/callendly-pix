import jwt from 'jsonwebtoken';

import Models from './../models';

const SECRET_KEY = process.env.SECRET_KEY as string;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string;
const REFRESH_TOKEN_EXPIRATION = '7d'; // Expiração do token de refresh

export const createToken = async (userId: unknown): Promise<{ token: string, refreshToken: string }> => {
  const user = await Models.User.findById(userId);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  const token = jwt.sign({ userId: userId}, SECRET_KEY, { expiresIn: '40s' });
  const refreshTokenRegenerated = jwt.sign({ userId: user._id }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });

  const databaseToken = new Models.Token({userId, refreshToken: refreshTokenRegenerated})
  await databaseToken.save()

  return { token, refreshToken: refreshTokenRegenerated};
};


export const refreshToken = async (refreshToken: string): Promise<{ token: string, refreshToken: string }> => {
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as { userId: string };
  const user = await Models.User.findById(decoded.userId);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  const tokenOnDb = await Models.Token.findOne({refreshToken});
  if (!tokenOnDb) {
    throw new Error('Token não encontrado');
  }

  await Models.Token.deleteOne({refreshToken})

  const {token, refreshToken: refreshTokenRegenerated} = await createToken(user._id)

  return { token, refreshToken: refreshTokenRegenerated};
};

export default {
    createToken,
    refreshToken
}