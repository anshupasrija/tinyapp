const express = require("express");
const cookieSession = require('cookie-session')
//  const cookieParser =require('cookie-parser');
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
    password: '$2a$10$f.wFEHrDR64MqEdL3QPHg.93Zfmqm2yE.Uv3EBZiPmR2fl44BYq9u',
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

const urlsForUser = function(id){
  const filterData = {};
  for(const shortURL in urlDatabase) {     
    if(urlDatabase[shortURL].userID ===id){
      filterData[shortURL] = urlDatabase[shortURL];
      //  console.log("adding val at key", urlDatabase[shortURL], filterData[shortURL]);
    }
    //  console.log("could not add val at key", urlDatabase[shortURL], filterData[shortURL]);
  }
  return filterData;
}




app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  console.log("Use_id is get methid is", user_id);
  const user = users[user_id];
  console.log("Usee in get methid is", user);
  
  if (!user_id) {
    // const templateVars = { urls: urlDatabase, user };
    return res.redirect("/login");  
  } else {
    const templateVars = { urls: urlsForUser(user_id), user };
    console.log(templateVars);
    res.render("urls_index", templateVars);
    // return res.send("Please login/register first:-");
  }
});

app.get("/urls/new", (req, res) => {
 
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = {
      user: user,
    };
    
    res.render('urls_new', templateVars); 
  
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  // console.log("short url ", urlDatabase[shortURL].longURL);
  
  if (!user_id) {
    return res.redirect("/login");
  }
  console.log("url for user", urlsForUser(user_id))
  if ( urlsForUser(user_id)[shortURL]){
    const user = users[user_id];
    const templateVars = {
      user: user,
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      
    };
    console.log("user in urls get", templateVars.user);    
    return res.render("urls_show", templateVars);
  }
  res.status(403).send(':id does not belong to them.');
});


app.post("/urls", (req, res) => {
  console.log(req.body);   
    const shortURL = generateRandomString();
    urlDatabase[shortURL]={longURL: req.body.longURL, user:req.session.user_id};
    // console.log(urlDatabase);
    res.redirect("/urls/");
  
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL].longURL;
    console.log("long url", longURL);
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
        // console.log("user id", user_id);
        // console.log("shorturlobjectid", shortUrlObjectUserId);
        // console.log("shorturl", shortURL);
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
        console.log("request body", req.body);
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
        // console.log("<<<<<<<>>>>>>");
        const newEmail = req.body.email;
        const newPassword = req.body.password;

        if (!newEmail || !newPassword) {
          return res.status(403).send("Email and Password are required:-");
        }

        const user = getUserByEmail(newEmail, users);
        console.log("user", user);
        console.log("new password", newPassword);
        if (!user) {
          return res.status(403).send("Invalid Email-");
        }
        console.log("this is encrypt version",
          bcrypt.compareSync(newPassword, user.password)
        );
        if (!bcrypt.compareSync(newPassword, user.password)) {
          return res.status(403).send("Invalid Password");
        }
        // console.log(req.session.user_id);
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
        console.log("hashed password", hashedPassword);
        const newuser = {
          id: newId,
          email: newEmail,
          password: hashedPassword
        };
        
        users[newId]= newuser;
        req.session.user_id= newuser.id;
        res.redirect('/urls');
        //  res.sendStatus(400);
      })
           
      
      
      
      app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}!`);
      });





      
      //  const belongsToUser = function(req,shortURL){
      //   const user_id =req.cookies["user_id"];
      //   console.log(urlDatabase[shortURL]);
      //   console.log(urlDatabase[shortURL].userID);
      //   console.log(user_id);
      //     if(urlDatabase[shortURL] && urlDatabase[shortURL].userID === user_id){
      //             return true;
      //     }
      //     return false;
      //  }