const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/questions');
const UserResponse = require('../models/UserResponse');
const { createQuestionsValidations, getAllQuestions } = require('./validations/questions');
/**
 * @route GET /api/v1/questions
 * @desc Get all questions
 * @access private
 */
router.get('/', [auth, getAllQuestions], async (request, response) => {

  const { courseType } = request.body;
  let allQuestions;
  try {
    allQuestions = await Question.find({ courseType }).select('text options');

    if (allQuestions) {
      return response.status(200).json({
        questions: allQuestions,
        totalCount: allQuestions?.length || 0
      });
    } else {
      return response.status(200).json({
        msg: "This course Don't have Any Questions Yet",
        totalCount: 0
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
router.post('/create', [auth, createQuestionsValidations], async (request, response, next) => {
  const { text, courseType } = request.body;

  let question = await Question.findOne({ text, courseType });
  if (question) {
    return response.status(400).json({
      msg: 'Question already exists',
    });
  }

  try {
    question = new Question(request.body);
    await question.save();

    return response.status(200).json({
      msg: 'Question inserted Succesfully! in course:  ' + courseType,
    });

  } catch (error) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error!' });
  }



});

/**
 * @route POST /api/v1/questions/check-answers
 * @desc Check Questions
 * @access private
 */
router.post('/check-answers', auth, async (request, response) => {
  const userId = request.user.id; // Assuming you're using authentication middleware to get user details
  const { userResponses, courseType } = request.body;
  try {
    // Retrieve all questions based on courseType
    const allQuestions = await Question.find({ courseType });
    console.log('pu', allQuestions);

    let totalScore = 0;
    let totalQuestions = allQuestions?.length || 0;
    if (allQuestions?.length == 0) {
      return response.status(400).json({ msg: 'This Course Dont have Questions Yet!' });
    }
    // Loop through each user response
    for (const userResponse of userResponses) {
      const question = allQuestions.find(q => q.id === userResponse.questionId);

      if (!question) {
        return response.status(400).json({ msg: 'Invalid question ID in user response',
                                           data: userResponse.questionId
                                         });
      }
      console.log('pou', userResponse.selectedOptions);
      console.log('poioiou', question);
      // Check if the user's selected options match the correct options
      const isCorrect = JSON.stringify(userResponse.selectedOption.sort()) === JSON.stringify(question.correctOption.sort());

      // Update user response in the database
      await UserResponse.findOneAndUpdate(
        { userId, questionId: userResponse.questionId },
        { selectedOptions: userResponse.selectedOptions },
        { upsert: true }
      );

      // If the answer is correct, increment the score
      if (isCorrect) {
        totalScore += 10; // Assuming each correct answer is worth 10 points
      }
    }
    let percentage = (totalScore / (totalQuestions * 10)) * 100;
    let remarks="";
    if(percentage<=100 && percentage >=90){
      remarks="Congratulations! You have secured highest Marks";
    }else if(percentage<=90 && percentage >=80){
      remarks="Excellent!"
    }else if(percentage<=79 && percentage >=70){
      remarks="Good!"
    }else if(percentage<=69 && percentage >=50){
      remarks="Average";
    }else{
      remarks="Failed!"
    }
    return response.status(200).json({ "Obtain": totalScore, "Total": totalQuestions * 10, 'percentage': percentage + '%',"Remarks":remarks });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: 'Server error' });
  }
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
