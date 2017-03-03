var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var routes = require("./routes");
var passport = require("passport");
var setUpPassport = require("./setuppassport");


var app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/SP");

setUpPassport();


app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
resave: true,
saveUninitialized: true
}));

app.use(express.static(path.join(__dirname,'public')));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
app.listen(app.get("port"), function() {
console.log("Server started on port " + app.get("port"));
});
