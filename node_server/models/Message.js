import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  message: String,
  fileUrl: String,
  fileType: String,
  fileName: String,
  timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', messageSchema);
