var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var cheerio = require('cheerio');
var URL = require('url-parse');
var request = require('request');
const cors = require('cors');
var mongoose = require('mongoose');
var index = require('./routes/index');

var isProduction = process.env.NODE_ENV == 'production';


var indexRouter = require('./routes/index').router;

var app = express();

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log(isProduction);

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI).then(function () {
    console.log("mongo connected success", process.env.MONGODB_URI);
  })
};

// mongoose.connect('mongodb://localhost:27017/searcheinsteinium')
// mongoose.connect('mongodb://ryamseyryam:Asdfg123@ds143163.mlab.com:43163/searcheinsteinium')

// mongoose.connect('');
app.use('/', indexRouter);
var SEASON_URI = 'http://178.216.250.167/Film/New-Server/Series/';
var MOVIE_URI = 'http://dl2.upload08.com/files/Film/250%20IMDB/';

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// index.crawlMovies(MOVIE_URI);
//   index.crawlSeasons(SEASON_URI);
// cron.schedule("12 * * * *", function(){
//   console.log("cron intitialize");
//   index.crawlMovies(MOVIE_URI);
//   index.crawlSeasons(SEASON_URI);
// },{
//   schedule: true,
//   timeZone: 'asia/mumbai'
// });
if (isProduction) {
 var crawlerCronJob = new CronJob({
    cronTime: '0 2 * * * *',
    onTick: function () {
      index.crawlMovies(MOVIE_URI);
      index.crawlSeasons(SEASON_URI);
    },
    timeZone: 'Asia/Kolkata',
  });
  crawlerCronJob.start();
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
let server = app.listen(process.env.PORT || 8000, function(){
  console.log('Listening on port '+ server.address().port);
});


module.exports = app;
