var express = require('express');
var router = express.Router();
var session = require('express-session');
const MongoStore = require('connect-mongo');
var express = require('express');
const expressValidator = require("express-validator");
var router = express.Router();



var bodyParser = require("body-parser");

//--
//++
var mongojs = require('mongojs');
const admin = require("firebase-admin");
var  ObjectId = mongojs.ObjectId;
var db = mongojs('clientesapp', ['users']);
//--

/*admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});*/

//++
// Middleware para el parseo del body
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}) );
//--
var session_email=null;
var users = [

  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@gmail.com',
  },
  {
    id: 2,
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bobsmith@gmail.com',

  },
  {
    id: 3,
    first_name: 'Jill',
    last_name: 'Jackson',
    email: 'jjackson@gmail.com',
  }
];
//declaración y definición de variables globales
router.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

/* GET users listing. */
router.get('/', function(req, res, next) {
 // res.send('respond with a resource');
  if(req.session.email) {
    db.users.find( function(err, docs){
      if (err){
        console.log(err);
      } else {
        console.log(docs)

        res.render('main.ejs', {
          title:'Costumers',
          //users: users,
          users: docs,
          sessionemail: req.session.email,
        })
      }})

  }
  else {
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});


// ++
router.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
        root=namespace.shift,
        formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() +']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value,
      sessionemail: session_email,
    };
  }
}));


router.post('/users/add', function(req, res){
  // (*1)  console.log("recibido");
  //  (*2) console.log(req.body.first_name)

  if(req.session.email) {

    // (*4)
    req.checkBody("first_name", "El nombre es obligatorio").notEmpty();
    req.checkBody("last_name", "El apellido es obligatorio").notEmpty();
    req.checkBody("email", "El email es obligatorio").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      //(*5)
      res.render('main.ejs', {
        title: 'costumers',
        users: users,
        errors: errors,
        sessionemail: session_email,
      });
    } else

        // (*3)
      var newUser = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
      };

    db.users.insert(newUser, function (err, resp) {
      if (err) {
        console.log(err)
      } else {
        db.users.insert(newUser)
      }
      res.redirect('/users');
    });
//	console.log(newUser)
  }else{
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});


router.delete('/users/delete/:id', function(req, res){
  if(req.session.email) {
    db.users.remove({_id: ObjectId(req.params.id)}, function (err, result) {
      if (err) {
        console.log(err);
      }
      res.redirect(303, '/users');
    });
  }else{
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});



router.post('/users/update/:id', function(req, res){
  if(req.session.email) {

    req.checkBody("first_name", "El nombre es obligatorio").notEmpty();
    req.checkBody("last_name", "El apellido es obligatorio").notEmpty();
    req.checkBody("email", "El email es obligatorio").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      //(*5)
      res.render('main.ejs', {
        title: 'costumers',
        users: users,
        errors: errors,
        sessionemail: session_email,
      });
    } else{
      db.users.update({_id: ObjectId(req.params.id)}, {
        $set: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email
        }
      }, function (err, result) {
        if (err) {
          console.log(err);
        }
        console.log('EDIT')
        res.redirect(303, '/users');

      });}
  }else{
    res.write('<h1>Please login first.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
});

module.exports = router;
