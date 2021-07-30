var AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

let headers = {
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Credentials':true
    // 'Access-Control-Allow-Headers':'Authorization'
  }

module.exports.join_meeting= async (event, context, callback)=>{
    //Recuperando parametro
    const {meetingId} = event.queryStringParameters
    const {userId} = get_auth_info(event)? get_auth_info(event):{}
    
    if(meetingId&&userId){ 
        //Pegando informações na chamada no banco de dados 
        const {data:meeting}  = await get_meeting(meetingId);
        //Se a "Meeting" existe
        if(meeting){
            //Recuperando informações do call
            const {chime_info:meetingInfo, subscribed_users} = meeting
            const resp = await checkCall(meetingInfo)
            //Se a call está ok
            if (resp && subscribed_users.some((user)=> user == userId)){
                console.log('Link stills alive')
                const Attendee = await joinCall(meetingInfo.MeetingId, userId)
                return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                Meeting: meetingInfo, 
                                Attendee: Attendee.Attendee
                            })
                        }
            //Se a call está com problemas
            }else if(subscribed_users.some((user)=> user == userId)){
                console.log('Link is dead')
                const call = await createCall(meetingId)
                const Attendee = await joinCall(call.Meeting.MeetingId, userId)
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        Meeting: call.Meeting, 
                        Attendee: Attendee.Attendee
                    })
                }
            }else{
                return {
                    statusCode: 400,
                    headers,
                    body: "Not allowed"
                }
            }
        //Se a  "Meeting" não existe
        }else{
            console.log("Meeting not found")
            return {
                statusCode: 400,
                headers
            }
        }
    }else{
        return {
            statusCode: 400,
            headers,
            body: "Not allowed"
        }
    }
}

async function createCall(id) {
    const request = {
      ClientRequestToken: id,
      ExternalMeetingId: id,
      MediaRegion: 'sa-east-1',
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    let meetingInfo = await chime.createMeeting(request).promise();
    console.log(meetingInfo)
    
    const meetingParams = {
        TableName: process.env.DDB_MEETINGS_TABLE,
        Key: { id },
        UpdateExpression: 'set #info = :info',
        ExpressionAttributeNames: {'#info' : 'chime_info'},
        ExpressionAttributeValues: {
         ':info' : meetingInfo,
        }
    }
    try{
        console.log("Updating call's table") 
        const result =await ddb.update(meetingParams).promise()
        return meetingInfo;
    }catch(putError){
        console.log("!!!ERROR!!!")
        console.log(putError)
        return putError
    }
};
  
async function joinCall (MeetingId, UserId){
  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
    MeetingId: MeetingId,
    ExternalUserId: UserId
  }).promise());
  return attendeeInfo
}

async function checkCall (Meeting){
    console.log("Checking call", Meeting)
    if(Meeting){
        let {MeetingId} = Meeting
        var params = {
        MeetingId /* required */
        };
        const resp = await chime.getMeeting(params, function(err, data) {}).promise().then((data)=>{return true}).catch((err)=> {return false});
        return resp
    }else{
        return false
    }
}


const get_auth_info = (event)=>{
    let data = null
    try{
      let claims  = event.requestContext.authorizer.claims
      data = {userId: claims['cognito:username'], email: claims.email}
    }finally{
      return data
    }
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
  