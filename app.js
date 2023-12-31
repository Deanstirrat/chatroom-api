var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
require('dotenv').config()
const User = require('./models/user');
require('./utils/authenticateToken');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const roomsRouter = require('./routes/rooms');

var app = express();

//json decoder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//authentication 
// Passport Local Strategy Configuration
passport.use('local', new LocalStrategy(
  async (username, password, done) => {
    try {
      // Find a user with the provided email
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // If authentication is successful, return the user object
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all routes
app.use(cors());

//middleware to check for valid token when accessing procested routes
app.use('/rooms', authenticateToken);

//link routers
app.use('/rooms', roomsRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
