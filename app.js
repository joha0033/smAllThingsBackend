require('dotenv').config();
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('./configuration')
//ridiculous looking variable for database URL
const dbURL = 'mongodb://'+process.env.DATABASE_CRED+':'+process.env.DATABASE_CRED+'@ds121099.mlab.com:21099/'+process.env.DATABASE_NAME

mongoose.Promise = global.Promise;


//incase we're testing
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ) {
  // var environment = process.env.NODE_ENV
  console.log('mongodb://localhost/APIAuthentication');
  mongoose.connect('mongodb://localhost/APIAuthentication');

} else {
  console.log('mongodb://localhost/APIAuthentication', 2);
  mongoose.connect(process.env.MONGOLAB_MAROON_URI || dbURL);
}


// Middlewares moved morgan into if for clear tests
if (!process.env.NODE_ENV === 'test') {

  app.use(morgan('dev'));

}

//creates express app
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// routes
app.use('/users', require('./routes/users.js'))
app.use('/posts', require('./routes/posts.js'))


module.exports = app
// module.exports = {
//   app,
//   environment
// }
