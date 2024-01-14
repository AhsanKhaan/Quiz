const mongoose = require('mongoose');

const questionsSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [{
    id: {
      required: true,
      type: Number
    },
    text: {
      type: String,
      required: true,
    },
    // Other option-related fields
  }],
  correctOption: [{
      type: Number,
      required: true,
      ref:'options.id'
    
  }],
  courseType: {
    type: String,
    required: true,
  },
  // Other question-related fields
});

module.exports = mongoose.model('Questions', questionsSchema);
