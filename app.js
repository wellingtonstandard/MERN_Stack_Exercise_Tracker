const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const routes = require('./routes/users');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();

mongoose
    .connect(process.env.DB, {useNewUrlParser: true})
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.log(err));

// Since mongoose's Promise is deprecated, we override it with Node's Promise
mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});



app.listen(5000, () => console.log('Server started on port 5000'));