'use strict';
const aws = require('aws-sdk')
const uuid = require('uuid');

const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE TOPIC <-- //
module.exports.create_topic = async (event, context) => {
  if(!event.body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }else{
    const body = JSON.parse(event.body)
    const {topicName, tagId, topicDescription} = body
    if(topicName){
      try{
        const topicId =await generateId(process.env.DDB_TOPICS_TABLE)
        const topicParams = {
          TableName: process.env.DDB_TOPICS_TABLE,
          Item: {
            id: topicId,
            topic_name: topicName,
            tag_id: tagId,
            topic_description:topicDescription,
            created_at: Date.now()
          }
        }
        const result =await ddb.put(topicParams).promise()
        console.log('Success')
        return {
          statusCode: 201,
          headers,
          body:JSON.stringify({topicId})
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
// --> UPDATE TOPIC <-- //
module.exports.update_topic = async (event, context) => {
  if(event.body){
    const {topicId, topicName, tagId, topicDescription} = JSON.parse(event.body)
    let updtExp = 'set'
    let ean = {}
    if(topicName){updtExp=updtExp+' #tn = :tn,'; ean['#tn']='topic_name';}
    if(tagId){updtExp=updtExp+' #ti = :ti,'; ean['#ti']='tag_id';}
    if(topicDescription){updtExp=updtExp+' #td = :td,'; ean['#td']='topic_description';}
    updtExp = updtExp.slice(0, -1)
    if ((topicId)&&(updtExp!='se')){
      const topicParams = {
        TableName: process.env.DDB_TOPICS_TABLE,
        Key: { id : topicId },
        UpdateExpression: updtExp,
        ExpressionAttributeNames: ean,
        ExpressionAttributeValues: {
          ':tn' : topicName,
          ':ti' : tagId,
          ':td' : topicDescription
        }
      }
      try{
        const result =await ddb.update(topicParams).promise()
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
// --> READ TOPIC <-- //
module.exports.read_topic = async (event, context) => {
  if(event.queryStringParameters){
    const {topicId} = event.queryStringParameters
    if(topicId){
      const topicParams = {
        TableName: process.env.DDB_TOPICS_TABLE,
        Key: { id : topicId }
      }
      try{
        const result =await ddb.get(topicParams).promise()
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

// --> DELETE TOPIC <-- //
module.exports.delete_topic = async (event, context) => {
  if(event.queryStringParameters){
    const {topicId} = event.queryStringParameters
    if(topicId){
      const topicParams = {
        TableName: process.env.DDB_TOPICS_TABLE,
        Key: { id : topicId }
      }

      try{
        const result =await ddb.delete(topicParams).promise()
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

// --> LIST USERS <-- //
module.exports.list_topics = async (event, context) => {
  const params = {
    TableName: process.env.DDB_TOPICS_TABLE,
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