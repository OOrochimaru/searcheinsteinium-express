var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovieSchema = new Schema({
    title: {type: String},
    download_link: {type: String}
});

module.exports = mongoose.model('movie', MovieSchema);