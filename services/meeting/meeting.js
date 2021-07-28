'use strict';
const aws = require('aws-sdk')
const uuid = require('uuid');

const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE MEETING <-- //
module.exports.create_meeting = async (event, context) => {
  if(!event.body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }else{
    const body = JSON.parse(event.body)
    const {tag, start} = body
    if(start){
      try{
        const meetingId =await generateId(process.env.DDB_MEETINGS_TABLE)
        const meetingParams = {
          TableName: process.env.DDB_MEETINGS_TABLE,
          Item: {
            id: meetingId,
            tag: tag,
            start: start,
            subscribed_users:[],
            active_users:{},
            created_at: Date.now()
          }
        }
        const result =await ddb.put(meetingParams).promise()
        console.log('Success')
        return {
          statusCode: 201,
          headers,
          body:JSON.stringify({meetingId})
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
// --> UPDATE MEETING <-- //
module.exports.update_meeting = async (event, context) => {
  if(event.body){
    const {meetingId, tag, start} = JSON.parse(event.body)
    if (meetingId){
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
      try{
        const result =await ddb.update(meetingParams).promise()
        return {
          statusCode: 200,
          headers:{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':true,
            'Access-Control-Allow-Headers':'Authorization'
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
// --> READ MEETING <-- //
module.exports.read_meeting = async (event, context) => {
  if(event.queryStringParameters){
    const {meetingId} = event.queryStringParameters
    if(meetingId){
      const meetingParams = {
        TableName: process.env.DDB_MEETINGS_TABLE,
        Key: { id : meetingId }
      }
      try{
        const result =await ddb.get(meetingParams).promise()
        console.log('Success')
        if (result.Item){
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
          };
        }else{
          return {
            statusCode: 204,
            headers,
            body: JSON.stringify(result)
          };
        }
        
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

// --> DELETE MEETING <-- //
module.exports.delete_meeting = async (event, context) => {
  if(event.queryStringParameters){
    const {meetingId} = event.queryStringParameters
    if(meetingId){
      const meetingParams = {
        TableName: process.env.DDB_MEETINGS_TABLE,
        Key: { id : meetingId }
      }

      try{
        const result =await ddb.delete(meetingParams).promise()
        console.log('Success')
        return {
          statusCode: 200,
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
    }
  }
  return {
    statusCode: 400,
    headers:{
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials':true,
      'Access-Control-Allow-Headers':'Authorization'
    }
  }
};

// --> LIST MEETINGS <-- //
module.exports.list_meetings = async (event, context) => {
  const params = {
    TableName: process.env.DDB_MEETINGS_TABLE,
  }

  try{
    const result =await ddb.scan(params).promise()
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

// --> JOIN MEETING <-- //
module.exports.join_meeting = async (event, context) => {
  const {meetingId} = event.queryStringParameters
  console.log('Event: ',event)
  const {userId} = get_auth_info(event)? get_auth_info(event):{}
  console.log('Auth: ', userId)
  if (meetingId && userId){
    const meetingParams = {
      TableName: process.env.DDB_MEETINGS_TABLE,
      Key: { id : meetingId },
      UpdateExpression: 'SET #su = list_append(#su, :ui)',
      ExpressionAttributeNames: {'#su' : 'subscribed_users'},
      ExpressionAttributeValues: {
        ':ui' : [userId],
      }
    }
    try{
      const result =await ddb.update(meetingParams).promise()
      return {
        statusCode: 200,
        headers:{
          'Access-Control-Allow-Origin':'*',
          'Access-Control-Allow-Credentials':true,
          'Access-Control-Allow-Headers':'Authorization'
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
  return {
    statusCode: 400,
    headers 
    }
};

const get_auth_info = (event)=>{
  let data = null
  try{
    let claims  = event.requestContext.authorizer.claims
    data = {userId: claims['cognito:username'], email: claims.email}
  }finally{
    return data
  }
 }

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

