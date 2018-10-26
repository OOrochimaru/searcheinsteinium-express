var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Movie = require('../model/movie');
var Season = require('../model/season');
var path = require('path');

var acceptedExt = ['.mkv', 'avi', '.mp4'];

site_to_visit = [];
module.exports.crawlSeasons = function(url){
  site_to_visit.push(url);
  scrapeInitializeSeason(url);
}
module.exports.crawlMovies = function(url){
  site_to_visit.push(url);
  scrapeInitializeMovie(url);
}

router.get('/', function(res, res, next){
  // url = 'http://dl2.upload08.com/files/Film/';
  return res.json({"season Test": "Hello world"});
  console.log()

});
scrapeInitializeSeason = function(url){

  if (site_to_visit.length > 0 ) {
    var currentSite = site_to_visit.pop();
    scrapeSeason(currentSite);
    console.log("visit", currentSite);
  }else{
    console.log("100 data reached");
    return;
  }
}
router.get('/movie', function(res, res, next){
  // url = 'http://dl2.upload08.com/files/Film/';
 
})
scrapeInitializeMovie = function(url){

  if (site_to_visit.length > 0 ) {
    var currentSite = site_to_visit.pop();
    scrapeMovie(currentSite);
    console.log("visit", currentSite);
  }else{
    console.log("100 data reached");
    return;
  }
}

scrapeMovie = function(url){
  request(url, function(err, response, body){
    if (err) {
      console.log(err);
    }
    var $ = cheerio.load(body);
    $('pre > a').each(function(){
      var data = $(this);
      var newUrlLink = data.attr('href');
      var downloadableLink = newUrlLink;
      var full_url = url + downloadableLink;
      var last_key = newUrlLink.charAt(newUrlLink.length - 1)
      var fileName = newUrlLink.replace(/.mkv|.mp4|.jpg/g,'').split('.').join(' ');
      if (acceptedExt.indexOf(path.extname(newUrlLink)) != -1) {
        saveMoviesInDataBase(fileName, full_url);
        console.log(fileName+"88888888888888888888888888888888888888");
        // console.log(newUrlLink.replace('.mkv', ''));
      }else if (last_key == '/' && newUrlLink != '../'){
        var newUrl = url + newUrlLink;
        site_to_visit.push(newUrl);
        scrapeInitializeMovie(newUrl);
      }
    });
  });
}
scrapeSeason = function(url){
  request(url, function(err, response, body){
    if (err) {
      console.log(err);
    }
    var $ = cheerio.load(body);
    $('pre > a').each(function(){
      var data = $(this);
      var newUrlLink = data.attr('href');
      var downloadableLink = newUrlLink;
      var full_url = url + downloadableLink;
      var last_key = newUrlLink.charAt(newUrlLink.length - 1)
      var fileName = newUrlLink.replace(/.mkv|.mp4|.jpg/g,'').split('.').join(' ');
      if (acceptedExt.indexOf(path.extname(newUrlLink)) != -1) {
        saveSeasonsInDataBase(fileName, full_url);
        console.log(fileName+"88888888888888888888888888888888888888");
        // console.log(newUrlLink.replace('.mkv', ''));
      }else if (last_key == '/' && newUrlLink != '../'){
        var newUrl = url + newUrlLink;
        site_to_visit.push(newUrl);
        scrapeInitializeSeason(newUrl);
      }
    });
  });
}

saveMoviesInDataBase = function(fileName, downloadableLink){
  var movie = new Movie({
    title : fileName,
    download_link : downloadableLink
  });
  movie.save().then(function(err){
    console.log("saved");
  });
}
saveSeasonsInDataBase = function(fileName, downloadableLink){
  var movie = new Season({
    title : fileName,
    download_link : downloadableLink
  });
  movie.save().then(function(){
    console.log("saved");
  });
}

router.get('/searchMovie', function(req, res, next){
  console.log("search movie enter ===============================");
  var data = req.query.title;
  var rows = parseInt(req.query.rows) ;
  console.log('req page', req.query.pageno);
  var offset = (req.query.pageno) * rows;

  var search = {};
  search.title = {"$regex": data, "$options":"i"};
  Promise.all([Movie.find(search).count(), Movie.find(search).skip(offset).limit(rows)
]).then(function(mainResult){
    var count = mainResult[0];
    var movies = mainResult[1];
    console.log(movies)
    return res.json({totalCount: count, movies: movies});
  });
});

router.get('/searchSeason', function(req, res, next){
  console.log('Search Season Entered++++++++++++++++++++++++', req.query.title);
  var searchData = req.query.title;
  var finalFormat = "";
  var seasonIndex = searchData.search(/season/gi);
  var episodeIndex = searchData.search(/episode/gi);

  var season_number;
  var episode_number;
  var title;
  season_number = parseInt(searchData.slice(seasonIndex+6));
  episode_number = parseInt(searchData.slice(episodeIndex+7));
  if (seasonIndex != -1 && episodeIndex != -1) {
    title = searchData.slice(0, seasonIndex);
    if (season_number < 9 && episode_number < 9) {
      finalFormat = title + `s0${season_number}e0${episode_number}`
    }else if (season_number > 9) {
      finalFormat = title + `s${season_number}e0${episode_number}`
    }else if(episode_number > 9){
      finalFormat = title + `s${season_number}e${episode_number}`;
    }
  }else if (seasonIndex != -1) {
    title = searchData.slice(0, seasonIndex);
    // season_number = parseInt(searchData.slice(seasonIndex+6, episodeIndex));
    console.log(season_number)
    if (season_number < 9) {
      finalFormat = title + `s0${season_number}`
    }else{
      finalFormat = title + `s${season_number}`;
    }
  }else if(episodeIndex != -1){
    title = searchData.slice(0, episodeIndex);
    // episode_number = parseInt(searchData.slice(episodeIndex+7));
    if (episode_number < 9) {
      finalFormat = title + `s01e0${episode_number}`
    }else{
      finalFormat = title + `s01e${episode_number}`;
    }
    // episode_number = parseInt(searchData.slice(episodeIndex+7));
  }else{
    finalFormat = searchData;
  }
  var searchSeason = {}
  console.log(typeof finalFormat);
  searchSeason.title = {"$regex": finalFormat , "$options": 'i'};

  Season.find(searchSeason).exec().then(function(seasons){
    return res.json({season: seasons});
  })

  console.log("Final Format "+finalFormat);

  console.log(season_number == 1);
  console.log(searchData +"season"+ seasonIndex + "season" 
  + episodeIndex+ 'sesonnumber'+ season_number
  + "episode number "+ episode_number);

})




/* GET home page. */
// router.get('/reddit', function(req, res, next) {

//   request('https://www.reddit.com', function(err, response, body){
//     if (err) {
//       console.log(err);
//     }
//     console.log("reddit")
//     var $ = cheerio.load(body);

//     $('div#siteTable > div.link').each(function(index){
//       var title = $(this).find('p.title > a.title').text().trim();
//       var score = $(this).find('div.score.unvoted').text().trim();
//       var user = $(this).find('a.author').text().trim();
//       console.log(title+ score + user);
//       fs.appendFileSync('reddit.txt', title + '\n' + score + '\n' + user + '\n');
//     })
//   })
  
// });


module.exports.router = router;
