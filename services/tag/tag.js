'use strict';
const aws = require('aws-sdk')
const uuid = require('uuid');

const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

// --> CREATE TAG <-- //
module.exports.create_tag = async (event, context) => {
  if(!event.body){
    console.log('Wrong')
    return {
      statusCode: 400,
      headers
    }
  }else{
    const body = JSON.parse(event.body)
    const {tagName, tagColor, tagDescription} = body
    if(tagName){
      try{
        const tagId =await generateId(process.env.DDB_TAGS_TABLE)
        const tagParams = {
          TableName: process.env.DDB_TAGS_TABLE,
          Item: {
            id: tagId,
            tag_name: tagName,
            tag_color: tagColor,
            tag_description:tagDescription,
            created_at: Date.now()
          }
        }
        const result =await ddb.put(tagParams).promise()
        console.log('Success')
        return {
          statusCode: 201,
          headers,
          body:JSON.stringify({tagId})
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
// --> UPDATE TAG <-- //
module.exports.update_tag = async (event, context) => {
  if(event.body){
    const {tagId, tagName, tagColor, tagDescription} = JSON.parse(event.body)
    let updtExp = 'set'
    let ean = {}
    if(tagName){updtExp=updtExp+' #tn = :tn,'; ean['#tn']='tag_name';}
    if(tagColor){updtExp=updtExp+' #tc = :tc,'; ean['#tc']='tag_color';}
    if(tagDescription){updtExp=updtExp+' #td = :td,'; ean['#td']='tag_description';}
    updtExp = updtExp.slice(0, -1)
    if ((tagId)&&(updtExp!='se')){
      const tagParams = {
        TableName: process.env.DDB_TAGS_TABLE,
        Key: { id : tagId },
        UpdateExpression: updtExp,
        ExpressionAttributeNames: ean,
        ExpressionAttributeValues: {
          ':tn' : tagName,
          ':tc' : tagColor,
          ':td' : tagDescription
        }
      }
      try{
        const result =await ddb.update(tagParams).promise()
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
// --> READ TAG <-- //
module.exports.read_tag = async (event, context) => {
  if(event.queryStringParameters){
    const {tagId} = event.queryStringParameters
    if(tagId){
      const tagParams = {
        TableName: process.env.DDB_TAGS_TABLE,
        Key: { id : tagId }
      }
      try{
        const result =await ddb.get(tagParams).promise()
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

// --> DELETE TAG <-- //
module.exports.delete_tag = async (event, context) => {
  if(event.queryStringParameters){
    const {tagId} = event.queryStringParameters
    if(tagId){
      const tagParams = {
        TableName: process.env.DDB_TAGS_TABLE,
        Key: { id : tagId }
      }

      try{
        const result =await ddb.delete(tagParams).promise()
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
module.exports.list_tags = async (event, context) => {
  const params = {
    TableName: process.env.DDB_TAGS_TABLE,
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