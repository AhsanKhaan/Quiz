const { check, validationResult } = require('express-validator');

const createQuestionsValidations = [
    check('text').notEmpty().withMessage('Question text is required.'),
    check('options').isArray({ min: 2 }).withMessage('At least two options are required.'),
    check('options.*.id').isInt({ min: 1 }).withMessage('Option ID must be a positive integer.'),
    check('options.*.text').notEmpty().withMessage('Option text is required.'),
    check('correctOption').isArray({ min: 1 }).withMessage('At least one correct option is required.'),
    check('correctOption.*').isInt({ min: 1 }).withMessage('Correct option ID must be a positive integer.'),
    check('courseType').notEmpty().withMessage('Course type is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports ={
    createQuestionsValidations
}