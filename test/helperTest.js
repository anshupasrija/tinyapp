const { assert } = require('chai');

const { getUserByEmail } = require('../helper');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("a@a.com", testUsers)   
    // Write your assert statement here
    assert.equal(user,testUsers. aJ48lW);
  });
   it('should return undefined when looking for a non-existent email',() =>{
     const user =getUserByEmail("abc@gmail.com", testUsers)
     assert.equal(user, undefined);
   })
});