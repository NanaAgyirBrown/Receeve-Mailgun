
const {v4: uuidv4 } = require('uuid');
var AWS = require('aws-sdk')

const validate = require('./mailgunvalidator')
const notification = require('./notifications')
const respObj = require('./responseApi');

const ret = require('./returnresponse');

const noSqlClient = new AWS.DynamoDB.DocumentClient();

let tableName = "recmailTbl";
if(process.env.ENV && process.env.ENV !== "NONE") tableName = tableName + '-' + process.env.ENV;

AWS.config.update({
  region: process.env.REGION
});

function getMailResponses(res){
     const params = {
        TableName: tableName,
        limit: 50
      };
      
      try {
        noSqlClient.scan(params, (error, data) => {        
          if(error) { 
            ret.cleanResponse(new respObj.responseApi(true, error.message, false, "", false, null), res);
          }
          else { 
            ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);
          }
        });
      } catch (error) {
        cret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null), res);
      }      
}

function saveMailResponse (mailgunPayload, res){
    if(!mailgunPayload) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  
    if(validate(mailgunPayload.signature.timestamp, mailgunPayload.signature.token, mailgunPayload.signature.signature)){
        const params = {
            TableName: tableName,
            Item: {
                Id: uuidv4(),
                data: mailgunPayload,
                Event: mailgunPayload["event-data"].event
            }
        };

        try 
        {
          noSqlClient.put(params, (error, data) => {
              if(error) ret.cleanResponse(new respObj.responseApi(true, error.message, false, "", false, null), res);
              else{
                  notification.publish(mailgunPayload.signature.timestamp, mailgunPayload["event-data"].event, res);

                  ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);
              }
          });

          //return  new respObj.responseApi(false, "", false, "", false, "Expectation failed. AWS DynamoDb could not be reached. Try later");
        }catch (error) {
          ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null), res);          
        }
    }else{
      ret.cleanResponse(new respObj.responseApi(true, "Alert! Mail response did not come from the right source.", false, "", false, null), res);
    }  
}

function getMailResponsesById(Id, res){
    if(!Id) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
    
    const params = {
        TableName: tableName,
        Key: {
            "Id": Id
        }
      };

      try {  
        noSqlClient.query(params, (error, data) => {
          if(error) ret.cleanResponse(new respObj.responseApi(true, error.message, false, "", false, null), res);
          else ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);     
        });
      } catch (error) {
        ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null),res);
      }    
}

function getMailResponsesByEvent(event, res){
  if(!event) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

    const params = {
      TableName: tableName,
      ConditionExpression: "Event = :a",
      ExpressionAttributeValues: {
          ":a": event
      }
    };
  
    try {  
      noSqlClient.query(params, (error, data) => {
        if(error) ret.cleanResponse(respObj.responseApi(true, error.message, false, "", false, null), res);
        else ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);     
      });
    } catch (error) {
      ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null), res);
    }    
}

function deleteMailResponsesById(Id, res) {
    if(!Id) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

    const params = {
        TableName: tableName,
        ConditionExpression: "Id = :a",
        ExpressionAttributeValues: {
            ":a": Id
        }
      };
    
      try {  
        noSqlClient.delete(params, (error, data) => {
          if(error) ret.cleanResponse(respObj.responseApi(true, error.message, false, "", false, null), res);
          else ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);     
        });
      } catch (error) {
        ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null), res);
      }  
}

function deleteMailResponsesByEvent(event, res) {
    if(!event) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

    const params = {
        TableName: tableName,
        ConditionExpression: "Event = :a",
        ExpressionAttributeValues: {
            ":a": event
        }
      };
    
      try {  
        noSqlClient.delete(params, (error, data) => {
          if(error) ret.cleanResponse(new respObj.responseApi(true, error.message, false, "", false, null), res);
          else ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, data.Items), res);     
        });
      } catch (error) {
        ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, null), res);
      }  
}

module.exports.saveMailResponse = saveMailResponse;
module.exports.getMailResponses = getMailResponses;
module.exports.getMailResponsesById = getMailResponsesById;
module.exports.getMailResponsesByEvent = getMailResponsesByEvent;
module.exports.deleteMailResponsesById = deleteMailResponsesById;
module.exports.deleteMailResponsesByEvent = deleteMailResponsesByEvent;
