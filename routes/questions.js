const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/questions');
const {createQuestionsValidations} =require('./validations/questions');
/**
 * @route GET /api/v1/questions
 * @desc Get all questions
 * @access private
 */
router.get('/', (req, res) => {
  res.send('Get all questions');
});

/**
 * @route POST /api/v1/questions
 * @desc Create a new questions
 * @access private
 */
router.post('/create',[auth,createQuestionsValidations],async (request, response,next) => {
  const {text,courseType}=request.body;

    let question=await Question.findOne({text,courseType});
    if (question) {
      return response.status(400).json({
        msg: 'Question already exists',
      });
    }

    try {
      question = new Question(request.body);
      await question.save();

      return response.status(200).json({
        msg: 'Question inserted Succesfully! in course'+courseType,
      });

    } catch (error) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error!' });
    }



});

/**
 * @route PUT /api/v1/questions/:id
 * @desc Update question by id
 * @access private
 */
router.put('/:id', (req, res) => {
  res.send('Update question by id');
});

/**
 * @route Delete /api/v1/questions/:id
 * @desc Delete question by id
 * @access private
 */
router.delete('/:id', (req, res) => {
  res.send('Delete question by ID');
});

module.exports = router;
