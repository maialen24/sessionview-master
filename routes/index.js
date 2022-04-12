var express = require('express');
var router = express.Router();
var session = require('express-session');
const MongoStore = require('connect-mongo');

var admin = require("firebase-admin");

var serviceAccount = require('/home/maialen/Escritorio/UNI/DAWE/11/dawe11-a356f-firebase-adminsdk-qywfl-9bb84be21d.json');
const expressValidator = require("express-validator");
//++
var bodyParser = require("body-parser");

//--
//++
var mongojs = require('mongojs');
var  ObjectId = mongojs.ObjectId;
var db = mongojs('clientesapp', ['users']);
//--

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});


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

// Use the session middleware
router.use(session({
  secret: 'clavesecretaparaexpresss',
  saveUninitialized: true, // create session even if there is nothing stored
  resave: true, // save session even if unmodified
  cookie: { maxAge: 60 * 60 * 1000 },
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/test-app'})
}));


router.get('/',(req,res) => {
  if(req.session.email) {
    return res.redirect('/users');
  }
  res.render('index', { title : 'title'});
});

router.post('/login',(req,res) => {
  req.session.email = req.body.email;
  session_email=req.session.email;
  res.end('done');
});
/*
router.get('/admin',(req,res) => {
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
});*/
router.get('/admin',(req,res) => {
    if(req.session.email) {
        res.write(`<h1>Hello ${req.session.email} </h1><br>`);
        res.end('<a href='+'/logout'+'>Logout</a>');
    }
    else {
        res.write('<h1>Please login first.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
    }
});

router.get('/logout',(req,res) => {
    session_email=null;
  req.session.destroy((err) => {
    if(err) {
      return console.log(err);
    }
    res.redirect('/');
  });

});

//
// /* GET home page. */
// router.get('/:idToken', function (req, res) {
//
//     const idToken = req.params.idToken;
//
// // idToken comes from the client app
//     admin.auth().verifyIdToken(idToken)
//         .then(function (decodedToken) {
//             let uid = decodedToken.uid;
//
//             admin.auth().getUser(uid)
//                 .then(function(userRecord) {
//                     // See the UserRecord reference doc for the contents of userRecord.
//                     console.log( "Email verified:" + userRecord.emailVerified);
//                     console.log('Successfully fetched user data:', userRecord.toJSON());
//                     req.session.email = userRecord.email;
//                     res.render('form', {title: userRecord.email});
//                 })
//                 .catch(function(error) {
//                     console.log('Error fetching user data:', error);
//                     res.render('error', {error: error, message: "Error fetching user data"});
//                 });
//
//         }).catch(function (error) {
//         // Handle error
//         res.render('error', {error: error, message: "You must be signed-up"});
//     });
//
//
// });

router.post('/getToken', (req, res) => {
  const idToken = req.body.idToken; // capturar parámetro

// idToken comes from the client app
// verificamos el idToken para ver si es válido
  admin.auth().verifyIdToken(idToken)
      .then(function (decodedToken) {
// si es válido, lo decodificamos
        let uid = decodedToken.uid;

// y obtenemos los datos asociados a ese usuario
        admin.auth().getUser(uid)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log('Successfully fetched user data:', userRecord.toJSON());
              req.session.email = userRecord.email;
              req.session.emailVerified = userRecord.emailVerified;
              res.send('{"status": "done"}');
            })
            .catch(function(error) {
              console.log('Error fetching user data:', error);
              res.send('{"status": "error"}');
            });

      }).catch(function (error) {
    // Handle error
    res.render('error', {error: error, message: "You must be signed-up"});
  });


});

// // Access the session as req.session
// router.get('/', function(req, res, next) {
//   if (req.session.views) {
//     req.session.views++;
//     res.setHeader('Content-Type', 'text/html');
//     res.write('<p>views: ' + req.session.views + '</p>');
//     res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
//     res.end()
//   } else {
//     req.session.views = 1;
//     res.end('welcome to the session demo. refresh!')
//   }
// });


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

//enrutamiento
/*
router.get("/admin", function(req, res){
    //res.send("Kaixo mundua")
    db.users.find( function(err, docs){
        if (err){
            console.log(err);
        } else {
            console.log(docs)

            res.render('main.ejs', {
                title:'costumers',
                //users: users,
                users: docs,
            })
        }})});*/


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
// --
module.exports = router;
