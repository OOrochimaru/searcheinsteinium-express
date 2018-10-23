var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Movie = require('../model/movie');

/* GET home page. */
router.get('/reddit', function(req, res, next) {

  request('https://www.reddit.com', function(err, response, body){
    if (err) {
      console.log(err);
    }
    console.log("reddit")
    var $ = cheerio.load(body);

    $('div#siteTable > div.link').each(function(index){
      var title = $(this).find('p.title > a.title').text().trim();
      var score = $(this).find('div.score.unvoted').text().trim();
      var user = $(this).find('a.author').text().trim();
      console.log(title+ score + user);
      fs.appendFileSync('reddit.txt', title + '\n' + score + '\n' + user + '\n');
    })
  })
  
});

router.get('/imdb', function(res, res, next){

  // url = 'http://dl2.upload08.com/files/Film/';
  url = 'http://dl2.upload08.com/files/Film/2017/';
  search_word = 'good will hunting';
  site_to_visit = [];
  scrapeInitialize(url);


 
})
scrapeInitialize = function(url){

  site_to_visit.push(url);
  if (site_to_visit.length >= 0 && site_to_visit.length < 10) {
    var currentSite = site_to_visit.pop();
    scrape(currentSite, search_word);
    console.log("visit", currentSite);
  }else{
    console.log("100 data reached");
    return;
  }
}

scrape = function(url, word){
  request(url, function(err, response, body){
    if (err) {
      console.log(err);
    }
    var $ = cheerio.load(body);
    $('pre > a').each(function(){
      var data = $(this);
      var newUrlLink = data.attr('href');
      var downloadableLink = newUrlLink;
      var last_key = newUrlLink.substr(newUrlLink.length - 1)
      if (last_key === '/' && newUrlLink !== '../') {
        var newUrl = url + newUrlLink;
        scrapeInitialize(newUrl);
      }else{
        console.log(downloadableLink+"*******************")
        var fileName = newUrlLink.replace(/.mkv|.mp4|.jpg/g,'').split('.').join(' ');
        saveInDataBase(fileName, downloadableLink);
       
        console.log(fileName+"88888888888888888888888888888888888888");
        // console.log(newUrlLink.replace('.mkv', ''));
      }
    });
  });
  // result.forEach(site => {
  //   console.log("for each", site);
  //   scrape(site, word);
  // })


}

saveInDataBase = function(fileName, downloadableLink){
  var movie = new Movie();
  movie.title = fileName;
  movie.download_link = downloadableLink;

  movie.save().then(function(){
    console.log("saved");
  });
}


module.exports = router;
