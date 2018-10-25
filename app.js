var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');
var fs = require('fs');
var cheerio =  require('cheerio');
var URL = require('url-parse');
var request = require('request');
var mongoose = require('mongoose');

var isProduction = process.env.NODE_ENV === 'production';


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect('mongodb://localhost:27017/moviesearch');
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// cron.schedule("* * * * *", function(){
//   console.log('Runs every minutes');
// })












// var startURL = "http://www.arstechnica.com";
// var search_word = 'google';
// var max_page_to_visit = 10;

// var page_visited= {};
// var no_of_page_visited = 0;
// var page_to_visit = [];
// var url = new URL(startURL);
// var baseUrl = url.protocol + '//' + url.hostname;
// page_to_visit.push(startURL);
// crawl();

// function crawl(){
//   if (no_of_page_visited >= max_page_to_visit) {
//     console.log("Maximum Pages Reached");
//     return;
//   }
//   var nextPage = page_to_visit.pop();

//   if (nextPage in page_visited) {
//     crawl();
//   }else{
//     //new page we haven't visited
//     visitPage(nextPage, crawl);
//   }
// }
// function visitPage(nextPage, callback){
//       //add page to our set
//       page_visited[url] = true;
//       no_of_page_visited++;

//       //make the request 
//       console.log("Visiting page " + url);
//       request(nextPage, function(err, response, body){
//         if (response.statusCode !== 200) {
//           callback();
//           return;  
//         }
//         //parse the document
//         var  $ = cheerio.load(body);
//         var isWordFound = searchForWords($, search_word);
//         if (isWordFound) {
//           console.log('Word ' + search_word + ' found at page ' + url);
//           // callback();
//         }else{
//           collectInternalLinks($);
//           callback();
//         }
        
//       });
// }

// // request(pageToVisit, function(err, response, body){
// //   if (err) {
// //     console.log(err);
// //   }
// //   if (response.statusCode === 200) {
// //     var $ = cheerio.load(body);
// //     console.log("Page Title", $('title').text());
// //   }
// // });

// function searchForWords($, word){
//   var bodyText = $('html > body').text().toLowerCase();
//   if (bodyText.indexOf(word.toLowerCase()) !== -1) {
//     return true;
//   }
//   return false;
// }

// function collectInternalLinks($){
//   var relativeLinks = $("a[href^='/']");
//   console.log("Found " + relativeLinks.length + " relative links on page");
//   relativeLinks.each(function(){
//     page_to_visit.push(baseUrl + $(this).attr('href'));
//   });
// }

























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
