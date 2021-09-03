const express = require("express");
const cookieParser =require('cookie-parser');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "1111",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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

 function urlsForUser(id){
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


 
function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
app.get("/", (req, res) => {

    res.redirect('/register');
  });
 



app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
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
  if (isLoggedIn(req)) {
    const user_id = req.cookies["user_id"];
    const user = users[user_id];
    const templateVars = {
      user: user,
     };

  res.render('urls_new', templateVars); 
      }
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
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
  if (isLoggedIn(req)) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL]={longURL: req.body.longURL, user:req.cookies["user_id"]};
  // console.log(urlDatabase);
  res.redirect("/urls/"+shortURL);
  }
  else { 
    return res.send('User is not logged in:-')
  }
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
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "user2RandomID",
//   },
// };

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const shortUrlObject = urlDatabase[shortURL];

  if (shortUrlObject === undefined) {
    res.send("errror");
  }
  const shortUrlObjectUserId = shortUrlObject.userID;
  const user_id = req.cookies["user_id"];
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
  const user_id = req.cookies["user_id"];
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

  if (!newEmail || !newPassword){
    return res.status(403).send('Email and Password are required:-')
  }
    
  const user = findUserEmail(newEmail , users)
  if (!user) {
    return res.status(403).send('Invalid Email-')
  }

  if(! bcrypt.compareSync(newPassword, user.password)){
    return res.status(403).send('Invalid Password');
  }
 
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});


app.post("/logout",(req,res)=>{ 
 res.clearCookie("user_id");  
  res.redirect('/urls');
});



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

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  const newuser = {
    id: newId,
    email: newEmail,
    password: hashedPassword
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
