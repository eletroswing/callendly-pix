import bcrypt from 'bcrypt';

import Models from './../models';
import { IUser } from './../models/user';
import { createToken } from './token';

const createUser = async (email: string, name: string, password: string): Promise<{ user: IUser, token: string, refreshToken: string }> => {
  const existingUser = await Models.User.findOne({ email });
  if (existingUser) {
    throw new Error('Já existe um usuário com este email.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new Models.User({ email, name, password: hashedPassword });
  await user.save();

  const {token, refreshToken} = await createToken(user._id)
  return { user, token, refreshToken };
};

const loginUser = async (email: string, password: string): Promise<{ user: IUser, token: string, refreshToken: string }> => {

  const user = await Models.User.findOne({ email });
  if (!user) throw new Error('Usuário não encontrado');

  const valid = await user.comparePassword(password)
  if (!valid) throw new Error('Senha incorreta');

  const {token, refreshToken} = await createToken(user._id)

  return { user, token, refreshToken };
};

const getUserById = async (id: string): Promise<IUser | null> => {
  return await Models.User.findById(id);
};

export default {
    createUser,
    loginUser,
    getUserById
}