var express = require("express");
var User = require("./models/user");
var passport = require("passport");
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');
var User = require('./models/user');
var Portfolio = require('./models/portfolio');
var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        var buf = crypto.randomBytes(16);
        cb(null, Date.now() + buf.toString('hex') + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
});

//locals
router.use(function(req, res, next) {

    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get("/", function(req, res, next) {
    User.find()
        .sort({
            createdAt: "descending"
        }).populate('portfolio')
        .exec(function(err, users) {
            if (err) {
                return next(err);
            }
            if(!users.length) {
              console.log(users);
            }

            res.render("index", {
                users: users


            });
        });
});


  router.get("/signup", function(req, res){
    res.render("signup");
  });

router.post("/signup", upload.single('profile_picture'),function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  var description = req.body.description;


  User.findOne({ username: username }, function(err, user){
    if (err) {
      return next(err);
    }

    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }
    var newUser;
    if(req.file){
      newUser=new User({
      username: username,
      password: password,
      description: description,
      profile_picture: req.file.filename
    });
  } else {

    newUser=new User({
      username: username,
      password: password,
      description: description

      });
  }




    newUser.save(next);

  });
},
passport.authenticate("login", {
successRedirect: "/",
failureRedirect: "/signup",
failureFlash: true
}));





router.get("/users/:username", function(req, res, next){
  User.findOne({ username: req.params.username }).populate('portfolio').exec(function(err, user){
    if (err) {
      return next(err);
    }
    if (!user){
      return next(404);
    }

    res.render("profile",{
      user: user,
      projects: user.portfolio
    });
  });
});




router.get("/myprofile", ensureAuthenticated, function(req, res, next){

  console.log(res.locals.currentUser.username );

  User.findOne({ username: res.locals.currentUser.username }).populate('portfolio').exec(function(err, user){
    if(err){
      return next(err);
    }

    if(!user) {
      return next(404);
    }

    res.render("profile", {
      user:user,
      projects: user.portfolio

  });


  });
});




router.get("/login", function(req, res) {
res.render("login");
});

router.post("/login", passport.authenticate("login", {

    successRedirect: "/" ,
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", function(req, res) {
req.logout();
res.redirect("/");
});



function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
next();
} else {
req.flash("info", "You must be logged in to see this page.");
res.redirect("/login");
}
}


router.get("/edit", ensureAuthenticated, function(req, res) {
res.render("edit");
});

router.post("/edit", upload.single('upl'), function(req, res, next){
  req.user.displayName= req.body.displayName;
  req.user.description = req.body.description;


  if(req.file) {
      req.user.profile_picture= req.file.filename;
  }

  req.user.save(function(err){
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });




});



router.get("/addproject", ensureAuthenticated, function(req, res){
  res.render("project");
  });

 router.post("/addproject", upload.array('photos',2), function(req, res, next){
var portfolio;
   if(req.files[0] && req.files[1]){
     portfolio = new Portfolio({
         _creator: req.user._id,
         project_name: req.body.project_name,
         description:req.body.description,
         screenshots: [req.files[0].filename,req.files[1].filename],
         links: [req.body.link1, req.body.link2, req.body.link3]
     });
   } else {

     portfolio = new Portfolio({
       _creator: req.user._id,
       project_name: req.body.project_name,
       description:req.body.description,
       links: [req.body.link1, req.body.link2, req.body.link3]
     });
   }


    portfolio.save(function(err){
      if(err){
        next(err);
      }
      req.user.portfolio.push(portfolio);


     req.user.save(function(err){
       if (err) {
         next(err);
         return;
       }

    });

       req.flash("info", "Project added!");
       res.redirect("/addproject");
     });

 });



module.exports = router;
