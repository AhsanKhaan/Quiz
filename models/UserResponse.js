const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'questions', required: true },
  selectedOptions: [Number],
});

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

module.exports = UserResponse;