const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/questions');
const {createQuestionsValidations,getAllQuestions} =require('./validations/questions');
/**
 * @route GET /api/v1/questions
 * @desc Get all questions
 * @access private
 */
router.get('/', [auth,getAllQuestions],async (request, response) => {

  const {courseType}=request.body;
  let allQuestions;
  try {
    allQuestions=await Question.find({courseType}).select('text options');

    if(allQuestions){
      return response.status(200).send(allQuestions);
    }else{
      return response.status(200).json({
        msg:"This course Don't have Any Questions Yet"
      });
    }


  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: error.message });
  }
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
        msg: 'Question inserted Succesfully! in course:  '+courseType,
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
