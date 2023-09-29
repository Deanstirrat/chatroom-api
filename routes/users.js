var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/userController');

//get all users
router.get('/', user_controller.users_get);

/* GET all users currently online */
router.get('/online', user_controller.users_online_get);

//account creation
router.post('/register', user_controller.user_create_post);

// User login
router.post('/login', user_controller.user_login_post);

module.exports = router;
