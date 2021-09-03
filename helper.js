

 const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


const getUserByEmail = function(email, database) {
  for(const user in database) 
  if(database[user].email === email){
  return database[user];
  }
  return undefined;
};

module.exports = {getUserByEmail ,generateRandomString};