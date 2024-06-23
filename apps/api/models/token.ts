import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
}

const TokenSchema: Schema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },

});

const Token = mongoose.model<IToken>('Token', TokenSchema);
export default Token;
