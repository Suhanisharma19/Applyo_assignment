const express = require('express');
const { getTest, createTestPoll } = require('../controllers/testController');

const router = express.Router();

router.route('/').get(getTest);
router.route('/create-test-poll').post(createTestPoll);

module.exports = router;