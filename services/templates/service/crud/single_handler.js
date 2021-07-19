'use strict';
const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE xxxxxx <-- //
module.exports.create = async (event, context) => {
  const body = JSON.parse(event.body)
  if(!body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }
  const {xxxxxxId, tag, start} = body
  const xxxxxxParams = {
    TableName: process.env.DDB_XXXXXX_TABLE,
    Item: {
      id: xxxxxxId,
      tag: tag,
      start: start
    }
  }
  // console.log(xxxxxxParams)
  try{
    const result =await ddb.put(xxxxxxParams).promise()
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

// --> UPDATE xxxxxx <-- //
module.exports.update = async (event, context) => {
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

  const {xxxxxxId, tag, start} = body

  const xxxxxxParams = {
    TableName: process.env.DDB_XXXXXX_TABLE,
    Key: { id : xxxxxxId },
    UpdateExpression: 'set #tg = :tg, #st = :st',
    ExpressionAttributeNames: {'#tg' : 'tag', '#st':'start'},
    ExpressionAttributeValues: {
      ':st' : start,
      ':tg' : tag,
    }
  }
  // console.log(xxxxxxParams)

  try{
    const result =await ddb.update(xxxxxxParams).promise()
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

// --> READ xxxxxx <-- //
module.exports.read = async (event, context) => {
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

  const {xxxxxxId} = query

  const xxxxxxParams = {
    TableName: process.env.DDB_XXXXXX_TABLE,
    Key: { id : xxxxxxId }
  }
  // console.log(xxxxxxParams)

  try{
    const result =await ddb.get(xxxxxxParams).promise()
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

// --> READ xxxxxx <-- //
module.exports.delete = async (event, context) => {
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

  const {xxxxxxId} = query

  const xxxxxxParams = {
    TableName: process.env.DDB_XXXXXX_TABLE,
    Key: { id : xxxxxxId }
  }

  try{
    const result =await ddb.delete(xxxxxxParams).promise()
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
