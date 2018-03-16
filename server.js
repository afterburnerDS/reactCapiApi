const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');const app = express();
const {CLIENT_ORIGIN} = require('./config');

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Book } = require('./models');
 
app.use(morgan('dev'));
app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);

passport.use(localStrategy);

app.use('/users/', usersRouter);
app.use('/auth/', authRouter);


 app.get('/api/*', (req, res) => {
   res.json({ok: true});
 });

//  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));


//get all books from user

app.get('/books', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Book
    .find({
      author: req.user
    }).sort({
      created: -1
    })
    .then(books => {
      res.json(books);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something went terribly wrong'
      });
    });
})


//new book
app.post('/books', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  console.log(req.body);
  const requiredFields = ['idBook','title', 'authorBook'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Book
    .create({
      idBook: req.body.idBook,
      title: req.body.title,
      authorBook: req.body.authorBook,
      url: req.body.url,
      date: req.body.date,
      pages: req.body.pages,
      description: req.body.description,
      annotations: req.body.annotations,
      author: req.user

    })
    .then(Book => res.status(201).json(Book.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went wrong'
      });
    });

});

// delete book
app.delete('/books/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  console.log("delete server");


  // Recipe
  //         .findByIdAndRemove(req.params.id)
  //         .then(() => {
  //           res.status(204).json({
  //             message: 'success'
  //           });
  //         })
  //         .catch(err => {
  //           console.error(err);
  //           res.status(500).json({
  //             error: 'something went terribly wrong'
  //           });
  //         });

  Book
    .findById(req.params.id)
    .then(book => {

      if (book.author.toString() === req.user._id.toString()) {

        Book
          .findByIdAndRemove(req.params.id)
          .then(() => {
            res.status(204).json({
              message: 'success'
            });
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({
              error: 'something went terribly wrong'
            });
          });
      } else {
        res.status(401).json({
          message: "no authorization"
        })
      }
    })

});


//update books
app.put('/books/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title','authorBook', 'url', 'date', 'pages', 'description','annotations'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Book
    .findById(req.params.id)
    .then(book => {


      if (book.author.toString() === req.user._id.toString()) {

        Book
          .findByIdAndUpdate(req.params.id, {
            $set: updated
          }, {
            new: true
          })
          .then(updatedBook => res.status(204).end())
          .catch(err => res.status(500).json({
            message: 'Something went wrong'
          }));
      } else {
        console.log("nop");
      }
    })


});




 // closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {
  runServer,
  app,
  closeServer
};

//  module.exports = {app};