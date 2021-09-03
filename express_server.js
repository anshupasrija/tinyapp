const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcryptjs');
const {getUserByEmail ,generateRandomString} = require('./helper');
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1' , 'key2'] 
}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "$2a$10$f.wFEHrDR64MqEdL3QPHg.93Zfmqm2yE.Uv3EBZiPmR2fl44BYq9u",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$f.wFEHrDR64MqEdL3QPHg.93Zfmqm2yE.Uv3EBZiPmR2fl44BYq9u",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const urlsForUser = function (id) {
  const filterData = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filterData[shortURL] = urlDatabase[shortURL];
    }
  }
  return filterData;
};




app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  if (!user_id) {
    return res.redirect("/login");
  } else {
    const templateVars = { urls: urlsForUser(user_id), user };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!user_id) {
    return res.redirect("/login");
  }
  if (urlsForUser(user_id)[shortURL]) {
    const user = users[user_id];
    const templateVars = {
      user: user,
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
    };
    return res.render("urls_show", templateVars);
  }
  res.status(403).send(":id does not belong to them.");
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    user: req.session.user_id,
  };
  res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("Short url doen't exist");
  }
});

       app.post("/urls/:shortURL/delete", (req, res) => {
        const shortURL = req.params.shortURL;
        const shortUrlObject = urlDatabase[shortURL];

        if (shortUrlObject === undefined) {
          res.send("errror");
        }
        const shortUrlObjectUserId = shortUrlObject.userID;
        const user_id = req.session.user_id;

        if (user_id === shortUrlObjectUserId) {
          delete urlDatabase[shortURL];
          res.redirect("/urls");
        } else {
          res.send("Sorry, not allowed here.\n");
        }
      });
      
      app.post("/urls/:shortURL", (req,res)=>{
        const shortURL=req.params.shortURL;  
        const shortUrlObjectUserId = urlDatabase[shortURL].userID;
        const user_id = req.session.user_id;        
        if( user_id === shortUrlObjectUserId ) {
          
          urlDatabase[shortURL].longURL= req.body.updatedURL;
          res.redirect('/urls');
        }  
        else {
          res.send('Access denied - sorry.');
        }
        
        
      });
      
      //Get login
      
      app.get("/login",(req,res)=>{ 
        const templateVars={
          user: null,
        }
        res.render( 'login', templateVars); 
      });
      
      //Post login
      
      app.post("/login", (req, res) => {        
        const newEmail = req.body.email;
        const newPassword = req.body.password;

        if (!newEmail || !newPassword) {
          return res.status(403).send("Email and Password are required:-");
        }

        const user = getUserByEmail(newEmail, users);       
        if (!user) {
          return res.status(403).send("Invalid Email-");
        }
        if (!bcrypt.compareSync(newPassword, user.password)) {
          return res.status(403).send("Invalid Password");
        }        
        req.session.user_id = user.id;
        res.redirect("/urls");
      });
      
      
      app.post("/logout",(req,res)=>{ 
        res.clearCookie("user_id");  
        res.redirect('/urls');
      });
      
      
      
      //Register
      
      
      app.get("/register",(req,res)=>{
        const user_id =req.session.user_id;
        const user = users[user_id];
        const templateVars = { user };  
        res.render("register",templateVars);
      });
      
      app.post("/register",(req,res)=>{
        const newId =generateRandomString();  
        const newEmail=req.body.email;
        const newPassword= req.body.password;
        if (!newEmail || !newPassword){
          return res.status(403).send('Email and Password are required:-')
        }
        
        const user = getUserByEmail(newEmail)
        if (user) {
          return res.status(403).send('Email already registered:-')
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);       
        const newuser = {
          id: newId,
          email: newEmail,
          password: hashedPassword
        };
        
        users[newId]= newuser;
        req.session.user_id= newuser.id;
        res.redirect('/urls');
        
      })
           
      
      
      
      app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}!`);
      });





     