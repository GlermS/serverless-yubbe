'use strict';
const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()
aws.config.update({region:'us-east-1'});

module.exports.create_meeting = async (event, context) => {
  const body = JSON.parse(event.input.body)
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
    // console.log(result)
    return {
      statusCode: 200,
      headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Headers':'Authorization'
      },
      body: JSON.stringify({
        message: 'Success',
        log: result,
      }),
    };
  }catch(putError){
    console.log("!!!ERROR!!!")
    console.log(putError)
  }
};
