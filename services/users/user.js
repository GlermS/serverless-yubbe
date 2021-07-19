'use strict';
const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE user <-- //
module.exports.create_user = async (event, context) => {
  const body = JSON.parse(event.body)
  if(!body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }
  const {userId, email, name, role} = body
  const userParams = {
    TableName: process.env.DDB_USERS_TABLE,
    Item: {
      id: userId,
      email,
      name,
      role
    }
  }
  // console.log(userParams)
  try{
    const result =await ddb.put(userParams).promise()
    console.log('Success')
    return {
      statusCode: 201,
      headers
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};

// --> UPDATE user <-- //
module.exports.update_user = async (event, context) => {
  const body = JSON.parse(event.body)
  if(!body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      }
    }
  }

  const {userId, email, name, role} = body

  const userParams = {
    TableName: process.env.DDB_USERS_TABLE,
    Key: { id : userId },
    UpdateExpression: 'set #ml = :ml, #nm = :nm, #rl = :rl',
    ExpressionAttributeNames: {'#ml' : 'email', '#nm':'name', '#rl':'role'},
    ExpressionAttributeValues: {
      ':ml' : email,
      ':nm' : name,
      ':rl' : role
    }
  }
  // console.log(userParams)

  try{
    const result =await ddb.update(userParams).promise()
    console.log('Success')
    return {
      statusCode: 201,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      }
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};

// --> READ user <-- //
module.exports.read_user = async (event, context) => {
  const query = event.queryStringParameters
  if(!query){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      }
    }
  }

  const {userId} = query

  const userParams = {
    TableName: process.env.DDB_USERS_TABLE,
    Key: { id : userId }
  }
  // console.log(userParams)

  try{
    const result =await ddb.get(userParams).promise()
    console.log('Success')
    return {
      statusCode: 201,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      },
      body: JSON.stringify(result)
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};

// --> READ user <-- //
module.exports.delete_user = async (event, context) => {
  const query = event.queryStringParameters
  if(!query){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      }
    }
  }

  const {userId} = query

  const userParams = {
    TableName: process.env.DDB_USERS_TABLE,
    Key: { id : userId }
  }

  try{
    const result =await ddb.delete(userParams).promise()
    console.log('Success')
    return {
      statusCode: 201,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      },
      body: JSON.stringify(result)
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};
