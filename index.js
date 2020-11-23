const express = require("express");
const bodyParser = require("body-parser");
const firebase = require("firebase/app");
const ejs = require("ejs");
const fs = require("fs");
require("firebase/auth");
require("firebase/firestore");
const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkq-CkpeiCu5NLP-v812RkaTsa3n3-qKo",
  authDomain: "signin-signup-9c5e0.firebaseapp.com",
  databaseURL: "https://signin-signup-9c5e0.firebaseio.com",
  projectId: "signin-signup-9c5e0",
  storageBucket: "signin-signup-9c5e0.appspot.com",
  messagingSenderId: "366043111969",
  appId: "1:366043111969:web:e83e12172ef3be083df960",
  measurementId: "G-53WKPTTW88"
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

app.get("/", function (req, res) {
  res.render("index");
})

app.post("/", function (req, res) {
  
  if (req.body.b1 == "signin") {
    res.redirect("/signin");
  }
  else {
    res.redirect("/signup");
  }
});

app.get("/signin", function (req, res) {
  res.render("signin")
});

app.post("/signin", function (req, res) {
  var email = req.body.inputEmail;
  var password = req.body.inputPassword;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      // Signed in 
      // ...

      res.redirect("/info");
    })
    .catch((error) => {
      res.send("signin unsuccesful. Please try again")
    });

})

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup", function (req, res) {
  var email = req.body.inputEmail;
  var password = req.body.inputPassword;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {

      res.redirect("/new-user");
      // Signed in 
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;

      res.send("Could not sign you up. Please try again")// ..
    });


});


app.get("/new-user", function (req, res) {
  firebase.auth().onAuthStateChanged(function (user) {


    if (user) {
      // User is signed in.
      res.render("new-user");
      // res.render("new-user");
    } else {
      // No user is signed in.
      res.send("User Not Authenticated. Please Retry")
    }
  });
});

app.post("/new-user", function (req, res) {

  var user = firebase.auth().currentUser;
  if (user != null) {
    var uid = user.uid;
  }

  const userData = {
    name: req.body.inputName,
    gender: req.body.genderOption,
    userId: uid
  }

  db.collection('user-info').add(userData)
    .then((result) => {
      if (result) {
        res.redirect("/info");
      }
      else {
        res.send("Data not saved. Try Again")
      }
    });


})

app.get("/info", function (req, res) {
  var uid, name, gender;
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.

      uid = user.uid;
     


      async function simpleQuery(db) {
        const userRef = db.collection("user-info");
        const snapshot = await userRef.where("userId", "==", uid).get();


        snapshot.forEach(doc => {
          name = doc.data().name;
          gender = doc.data().gender;
        });

        res.render("info", { name: name, gender: gender })
      }

      simpleQuery(db);







    } else {
      // No user is signed in.
      res.send("Please LogIn")
    }
  });
})

app.post("/info", function (req, res) {
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
    res.redirect("/")
  }).catch(function (error) {
    // An error happened.
    res.send("signout failed. Please Reload")
  });

})



let port=process.env.PORT;

if(port== null ||port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started ");
});
