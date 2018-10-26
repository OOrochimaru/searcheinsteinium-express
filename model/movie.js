var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovieSchema = new Schema({
    title: {type: String, unique:true},
    download_link: {type: String, unique: true}
});

module.exports = mongoose.model('movie', MovieSchema);