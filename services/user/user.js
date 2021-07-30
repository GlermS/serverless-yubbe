'use strict';
const aws = require('aws-sdk')
const uuid = require('uuid');

const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> UPDATE user <-- //
module.exports.update_user = async (event, context) => {
  console.log(context)
  if(event.body){
    const body = JSON.parse(event.body)
    const {userId, email, firstName, lastName} = body
    if (userId){
      const userParams = {
        TableName: process.env.DDB_USERS_TABLE,
        Key: { id : userId },
        UpdateExpression: 'set #ml = :ml, #fn = :fn, #ln = :ln',
        ExpressionAttributeNames: {'#ml' : 'email', '#fn':'first_name', '#ln':'last_name'},
        ExpressionAttributeValues: {
          ':ml' : email,
          ':fn' : firstName,
          ':ln' : lastName
        }
      }
      try{
        const result =await ddb.update(userParams).promise()
        return {
          statusCode: 200,
          headers
        };
      }catch(putError){
        console.log("!!!ERROR!!!")
        console.log(putError)
        return {
          statusCode: 500,
          headers
        }
      }
    }
  }
  return {
    statusCode: 400,
    headers
  }  
};
// --> READ user <-- //
module.exports.read_user = async (event, context) => {
  if(event.queryStringParameters){
    const {userId} = event.queryStringParameters
    if (userId){
      const userParams = {
        TableName: process.env.DDB_USERS_TABLE,
        Key: { id : userId }
      }
      try{
        const result =await ddb.get(userParams).promise()

        if (!isEmpty(result)){
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Item)
          }
        }else{
          return {
            statusCode: 204,
            headers
          }        
        };
      }catch(putError){
        console.log("!!!ERROR!!!")
        console.log(putError)
        return {
          statusCode: 500,
          headers
        }
      }
    }
  }
  return {
    statusCode: 400,
    headers
  }
};
// --> DELETE USER <-- //
module.exports.delete_user = async (event, context) => {
  if(event.queryStringParameters){
    const {userId} =event.queryStringParameters
    if(userId){
      const userParams = {
        TableName: process.env.DDB_USERS_TABLE,
        Key: { id : userId }
      }
      try{
        const result =await ddb.delete(userParams).promise()
        console.log(result)

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      }catch(putError){
        console.log("!!!ERROR!!!")
        console.log(putError)
        return {
          statusCode: 500,
          headers
        }
      }
    }
  }
  return {
    statusCode: 400,
    headers
  }
};
// --> LIST USERS <-- //
module.exports.list_users = async (event, context) => {
  const userParams = {
    TableName: process.env.DDB_USERS_TABLE,
  }

  try{
    const result =await ddb.scan(userParams).promise()
    console.log(result)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items)
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};
// --> SIGN UP <-- //
module.exports.postsign_up = async (event, context) => {
  console.log('POST SIGN UP')
  console.log('Event =>', event)

  var {email} = event.request.userAttributes
  const userId = event.userName;
  const userPool = event.userPoolId;

  if (email && userPool && userId){
      try{
        const userParams = {
          TableName: process.env.DDB_USERS_TABLE,
          Item: {
            id: userId,
            email,
            status: "INCOMPLETE_REGISTRATION",
            user_pool_id: userPool,
            created_at: Date.now()
          }
        }
        const result =await ddb.put(userParams).promise()
        console.log('REGISTRADO => email:',email)
        return event
    }catch(putError){
        console.log("!!!ERROR!!!")
        console.log(putError)
        return event
      }
  }
  return event
};

const generateId = async (table)=> {
  let unique = false;
  while (!unique){
    var id = uuid.v4()
    const params = {
      TableName: table,
      Key: { id }
    }
    const result =await ddb.get(params).promise();
      if (!result.Item){
        unique=true
      }
  } 
  return id
}

const isEmpty = (obj) =>{
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}