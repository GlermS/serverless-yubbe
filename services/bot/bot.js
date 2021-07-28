'use strict';
const aws = require('aws-sdk')
const uuid = require('uuid');
const util = require('util');

const ddb = new aws.DynamoDB.DocumentClient()
let headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Credentials':true,
  'Access-Control-Allow-Headers':'Authorization'
}

const response ={
  success:{
    statusCode: 200,
  },
  missignRequired: {
    statusCode: 400,
  },
  badRequest: {
    statusCode: 400,
  },
  notAllowed: {
    statusCode: 405 ,
  }
}

// --> JOIN MEETING CHANNEL<-- //
module.exports.join_meeting_channel = async (event, context) => {
  console.log('Entrou, evento:\n',event)
  const {meetingId, userId, connectionId} = getConnetionInfo(event);
  if(meetingId && userId && connectionId){
    const {data:meeting}  = await get_meeting(meetingId);
    console.log(meeting)
    if(meeting){
      if(meeting.subscribed_users.find((item)=>{return item == userId})){
        if(meeting.active_users[userId]){
          meeting.active_users[userId]["websocket_connection"] = connectionId
        }else{
          meeting.active_users[userId]  ={"websocket_connection": connectionId}
        }
        
        const meetingParams = {
          TableName: process.env.DDB_MEETINGS_TABLE,
          Key: { id : meetingId },
          UpdateExpression: 'SET #au = :au',
          ExpressionAttributeNames: {'#au' : 'active_users'},
          ExpressionAttributeValues: {
            ':au' : meeting.active_users,
          }
        }
        console.log('Params: ', meetingParams)
        const result =await ddb.update(meetingParams).promise()
        console.log("Retornar com sucesso ",result)
        return response.success
      }else{
        console.log('Usuário não inscrito')
        return response.notAllowed
      }
    }else{
      console.log('Meeting não encontrada')
      return response.badRequest
    }
  }else{
    console.log("Faltou o id")
    return response.badRequest
  }
};


// --> CHOOSE SPEAKER <-- //
module.exports.choose_speaker = async (event, context) => {
  const {callbackUrl, data, action} = getConnetionInfo(event);
  const {meetingId} = data? data:{}
  if(meetingId){
    const {data:meeting}  = await get_meeting(meetingId);
    if(meeting){
      const active_users = Object.keys(meeting.active_users);
      const chosen_speaker = pick_random(active_users);
      console.log('Chosen ',chosen_speaker)
      await broadcast(callbackUrl, meeting, {action, response:chosen_speaker}) 
      return response.success
    }else{
      return response.badRequest
    }  
  }
  return response.badRequest
};

// --> SUGGEST TOPIC <-- //
module.exports.suggest_topic = async (event, context) => {
  const {callbackUrl, data, action} = getConnetionInfo(event);
  const {meetingId} = data? data:{}
  if(meetingId){
    const {data:meeting}  = await get_meeting(meetingId);
    if(meeting){
      const params = {
        TableName: process.env.DDB_TOPICS_TABLE,
      }
      try{
        const result =await ddb.scan(params).promise();
        console.log('DB response: ',result.Items)
        await broadcast(callbackUrl, meeting, {action, response: pick_random(result.Items)});
        return response.success
      }catch{
        return response.badRequest
      }
    }else{
      return response.badRequest
    }
  }else{
    return response.badRequest
  } 
};

const sendMessageToClient = (url, connectionId, payload) =>
  new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new aws.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: url,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.log('err is', err);
          reject(err);
        }
        resolve(data);
      }
    );
  });

const getConnetionInfo = (event) =>{
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrlForAWS = util.format(util.format('https://%s/%s', domain, stage)); //construct the needed url
  const headers = event.headers;
  const body = event.body? JSON.parse(event.body):null;

  return {callbackUrl:callbackUrlForAWS, connectionId, ...headers, ...body}
} 

const pick_random = (list) =>{
  let options = list
  const chosen_index = Math.floor(Math.random() * options.length);

  return list[chosen_index]
}

const get_meeting = async (meetingId) => {
  try{
    const meetingParams = {
      TableName: process.env.DDB_MEETINGS_TABLE,
      Key: { id : meetingId }
    }
    const result =await ddb.get(meetingParams).promise()
    console.log('Success')
    if (result.Item){
      return {
        error: null,
        data: result.Item
      };
    }else{
      return {
        error: {
          code: 'NotFound',
          statusCode: 400
        },
        data: null
      };
    }
  }catch(getError){
    console.log("!!!ERROR!!!")
    console.log(getError)
    return {
      error: getError,
      data: null
    };
  } 
};

const broadcast = async(callbackUrl,meeting, payload)=>{
  const active_users = Object.keys(meeting.active_users);
  active_users.forEach(async (user) =>{
    try{
      await sendMessageToClient(callbackUrl, meeting.active_users[user].websocket_connection, payload);
    }catch(error){
      console.log('Error on sending: ',error)
    }
  }) 
}
