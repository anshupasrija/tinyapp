const express = require("express");
const cookieParser =require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id =req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { urls: urlDatabase,  user };
  // console.log("res cookie",req.cookies["username"]);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); 
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=req.body.longURL;
  // console.log(urlDatabase);
  res.redirect("/urls/"+shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL=req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  // console.log("long url",longURL);
  
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete",(req,res)=>{
  shortURL=req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req,res)=>{
  const shortURL=req.params.shortURL;
  const updatedURL=req.body.updatedURL; 
  urlDatabase[shortURL]= updatedURL
  // console.log("updated url",updatedURL);
  res.redirect("/urls");


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
  if (!newEmail || !newPassword){
    return res.status(403).send('Email and Password are required:-')
  }
    
  const user = findUserEmail(newEmail , users)
  if (!user) {
    return res.status(403).send('Invalid Email-')
  }

  if(user.password !== newPassword ){
    return res.status(403).send('Invalid Password');
  }
 
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});


app.post("/logout",(req,res)=>{ 
 res.clearCookie("user_id");  
  res.redirect('/urls');
});

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "a@a.com", 
    password: "1111"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Register


app.get("/register",(req,res)=>{
 const user_id =req.cookies["user_id"];
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
    
  const user = findUserEmail(newEmail)
  if (user) {
    return res.status(403).send('Email already registered:-')
  }

  const newuser = {
    id: newId,
    email: newEmail,
    password: newPassword
  };

  users[newId]= newuser;
   res.cookie('user_id', newuser.id);
   res.redirect('/urls');
  //  res.sendStatus(400);
})

const findUserEmail = function(email, users){
  for(const element in users){
    // console.log(element);
    console.log("user element",users[element].email);
    if(users[element].email === email){
      console.log(users[element]);
      return users[element];
    }   
  }
  return false;
}



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
