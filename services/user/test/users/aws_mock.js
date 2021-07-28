'use strict';
const AWS = require('aws-sdk-mock')
const AWS_SDK = require('aws-sdk')
AWS.setSDKInstance(AWS_SDK)
AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
  const {TableName, Key, UpdateExpression} = params
  if ((TableName)&&(Key)&&(UpdateExpression)){
    if(TableName == process.env.DDB_USERS_TABLE){
    callback(null, {}  );
    }
  }
  callback(null, 'Wrong params'  )
});
AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
  const {TableName, Key} = params
  if ((TableName)&&(Key)){
    if(TableName == process.env.DDB_USERS_TABLE){
      if(Key.id == '0000'){
        callback(null,  {
          Item: {
            created_at: 1626726563717,
            last_name: 'Create',
            role: 'standard',
            first_name: 'João',
            id: Key.id,
            email: 'joãozinho'
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
    if(TableName == process.env.DDB_USERS_TABLE){
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
    if(TableName == process.env.DDB_USERS_TABLE){
      if(Key.id == '0000'){
        callback(null, {Item:{id:'0000'}} );
      }else{
         callback(null, {}  );
      }   
    }
  }
  callback(null, 'Wrong params'  )
});