const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/questions');
const UserResponse = require('../models/UserResponse');
const { createQuestionsValidations, getAllQuestions } = require('../validations/questions');
/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API operations related to questions
 */

/**
 * @swagger
 * /api/v1/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               questions: [{ text: "What is your question?", options: [...] }]
 *               totalCount: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 * @swagger
 * /api/v1/questions/create:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             text: "What is your question?"
 *             options: [{ id: 1, text: "Option 1" }, { id: 2, text: "Option 2" }]
 *             correctOption: [1]
 *             courseType: "Math"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               msg: "Question inserted Successfully! in course: Math"
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
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
 * @swagger
 * /api/v1/questions/check-answers:
 *   post:
 *     summary: Check user answers
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userResponses: [{ questionId: "123", selectedOptions: [1] }]
 *             courseType: "Math"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               Obtain: 20
 *               Total: 30
 *               percentage: 66.67%
 *               Remarks: "Good!"
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
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

module.exports = router;
