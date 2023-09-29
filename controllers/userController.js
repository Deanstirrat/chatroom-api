const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Custom validation function to check if two password fields match
const passwordsMatch = (value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  }
  return true;
};

/* GET all users currently online */
exports.users_online_get = asyncHandler(async (req, res, next) => {
	const onlineUsers = await User.find({online: true}, '_id username online').sort({username: 1});
	res.json(onlineUsers);
});

/* GET all users */
exports.users_get = asyncHandler(async (req, res, next) => {
	const onlineUsers = await User.find().select('_id username online').sort({online: 1, username: 1});
	res.json(onlineUsers);
});

//account creation
exports.user_create_post = [
	//form validation/sanitization
    body("email")
      .trim()
      .isLength({ min: 1 })
      .withMessage('text must not be blank')
      .escape(),
    body("username")
      .trim()
      .isLength({ min: 1 })
      .withMessage('text must not be blank')
      .escape(),
    body("password")
      .trim()
      .isStrongPassword({minSymbols: 0})
      .withMessage("Must be strong password")
      .escape(),
    body("passwordConfirm")
      .trim()
      .custom(passwordsMatch),


	async (req, res) => {

    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('there are validation errors');
      return res.status(400).json(errors);
    }

		try {
      const { username, email, password} = req.body;

      //check if email exists
      const existingEmail = await User.findOne({ email });
      if(existingEmail) return res.status(409).json({ error: 'User with this email already exists' });
      //check if username exists
      const existingUser = await User.findOne({ username });
      if(existingUser) return res.status(409).json({ error: 'User with this username already exists' });

      //create new user
			const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
			const user = new User({ username, email, password:hashedPassword});
			await user.save();

			res.status(201).send('User registered successfully');

		  } catch (error) {
			res.status(500).send('Error registering user');
		  }
	},
];

// User login
exports.user_login_post = [
    //form validation/santization
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage('username must not be blank')
        .escape(),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage('password must not be blank')
        .escape(),


    async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(401).send('Invalid username or password');
        
        passport.authenticate('local', { session: false }, (err, user, info) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            return res.status(401).json({ message: info.message });
          }
          
          // Generate a JWT token
           const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' }); 
           
           console.log("user ID");
           console.log(user._id);

           console.log("login sucess");
          // Send the JWT token in the response
          res.json({token});
          //update user as online
          User.findOneAndUpdate({username: req.body.username}, {online: true});
        })(req,res,next);
    },
];