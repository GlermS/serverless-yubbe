'use strict';
const AWS = require('aws-sdk-mock')
const AWS_SDK = require('aws-sdk')
AWS.setSDKInstance(AWS_SDK)
AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
  const {TableName, Key, UpdateExpression} = params
  if ((TableName)&&(Key)&&(UpdateExpression)){
    if(TableName == process.env.DDB_MEETINGS_TABLE){
    callback(null, {}  );
    }
  }
  callback(null, 'Wrong params'  )
});
AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
  const {TableName, Key} = params
  if ((TableName)&&(Key)){
    if(TableName == process.env.DDB_MEETINGS_TABLE){
      if(Key.id == '0000'){
        callback(null,  {
          Item: {
            created_at: 1626726563717,
            start: 'Create',
            tag: 'standard',
            id: Key.id,
          }});
      }else{
         callback(null, {}  );
      }   
    }
  }
  callback(null, 'Wrong params'  )
});

AWS.mock('DynamoDB.DocumentClient', 'delete', function (params, callback){
  const {TableName, Key} = params
  if ((TableName)&&(Key)){
    if(TableName == process.env.DDB_MEETINGS_TABLE){
      if(Key.id == '0000'){
        callback(null, {Item:{id:'0000'}} );
      }else{
         callback(null, {Item:{}}  );
      }   
    }
  }
  callback(null, 'Wrong params'  )
});

AWS.mock('DynamoDB.DocumentClient', 'update', function (params, callback){
  const {TableName, Key} = params
  if ((TableName)&&(Key)){
    if(TableName == process.env.DDB_MEETINGS_TABLE){
      if(Key.id == '0000'){
        callback(null, {Item:{id:'0000'}} );
      }else{
         callback(null, {}  );
      }   
    }
  }
  callback(null, 'Wrong params'  )
});