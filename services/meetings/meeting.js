'use strict';
const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE MEETING <-- //
module.exports.create_meeting = async (event, context) => {
  const body = JSON.parse(event.body)
  if(!body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }
  const {meetingId, tag, start} = body
  const meetingParams = {
    TableName: process.env.DDB_MEETINGS_TABLE,
    Item: {
      id: meetingId,
      tag: tag,
      start: start
    }
  }
  // console.log(meetingParams)
  try{
    const result =await ddb.put(meetingParams).promise()
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

// --> UPDATE MEETING <-- //
module.exports.update_meeting = async (event, context) => {
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

  const {meetingId, tag, start} = body

  const meetingParams = {
    TableName: process.env.DDB_MEETINGS_TABLE,
    Key: { id : meetingId },
    UpdateExpression: 'set #tg = :tg, #st = :st',
    ExpressionAttributeNames: {'#tg' : 'tag', '#st':'start'},
    ExpressionAttributeValues: {
      ':st' : start,
      ':tg' : tag,
    }
  }
  // console.log(meetingParams)

  try{
    const result =await ddb.update(meetingParams).promise()
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

// --> READ MEETING <-- //
module.exports.read_meeting = async (event, context) => {
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

  const {meetingId} = query

  const meetingParams = {
    TableName: process.env.DDB_MEETINGS_TABLE,
    Key: { id : meetingId }
  }
  // console.log(meetingParams)

  try{
    const result =await ddb.get(meetingParams).promise()
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

// --> READ MEETING <-- //
module.exports.delete_meeting = async (event, context) => {
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

  const {meetingId} = query

  const meetingParams = {
    TableName: process.env.DDB_MEETINGS_TABLE,
    Key: { id : meetingId }
  }

  try{
    const result =await ddb.delete(meetingParams).promise()
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
