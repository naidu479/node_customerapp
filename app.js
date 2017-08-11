var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator')
var mongojs = require('mongojs')
var db = mongojs('customerapp', ['users'])

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
// app.use('/users/add', users);

// Global Vars
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.post('/users/add', function(req, res, next) {
  req.checkBody('first_name', 'First Name is Required').notEmpty();
  req.checkBody('last_name', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();
  req.getValidationResult().then(function(result){
    if (!result.isEmpty()){
      db.users.find(function (err, docs) {
        res.render('index', { title: 'Express', users: docs, errors: result.array() });
      })
    } else {
      var newUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email
      }
      db.users.insert(newUser, function(err, result){
        if(err){
          console.log('ERROR')
        }else{
          res.redirect('/')
        }
      });
    }
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
