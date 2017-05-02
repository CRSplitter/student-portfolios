var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var portfolioSchema = Schema({
  _creator: { type: mongoose.Schema.Types.ObjectId , ref:'User' },
  project_name: String,
  description: String,
  screenshots: [{  type: String }],
  links: [{ type: String }],

});

var Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
