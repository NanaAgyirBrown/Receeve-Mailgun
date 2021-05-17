var AWS = require('aws-sdk');
const { fstat } = require('fs');

const respObj = require('./responseApi');
const ret = require('./returnresponse')

AWS.config.update({
    region: process.env.REGION
});

const sns = new AWS.SNS();

 function subcribe(subTypes, res){
    if(!subTypes) new respObj.responseApi(true, "Empty Payload", false, "", false, null);

    let params = {
        Protocol: subTypes.Protocol,
        TopicArn: subTypes.Topic,
        Endpoint: subTypes.EndPoint
    };

    try {
        sns.subscribe(params, (err, data) => {
            if (err) ret.cleanResponse(new respObj.responseApi(true, err.message, false, "", false, null), res);
            else ret.cleanResponse(new respObj.responseApi(true,"", false, "", true, data), res);
        });
    } catch (error) {
        ret.cleanResponse(new respObj.responseApi(true, "", true, error.message, false, null), res);
    }    
}

function publish(timestamp, type){
    if(!timestamp || !type) new respObj.responseApi(true, "Empty Payload", false, "", false, null);

    let notice = {
        Provider: "Mailgun",
        timestamp: timestamp,
        type: type
    };
   
    let params = {
        Message: JSON.stringify(notice),
        Subject: "Notification from Receeve",
        TopicArn: process.env.ARN
    };

    try {
        sns.publish(params, function(err, data) {
            if (err) ret.cleanResponse(new respObj.responseApi(true, err.message, false, "", false, null));
            else ret.cleanResponse(new respObj.responseApi(true, "", false, "", true, data), null);
        });        
    } catch (error) {
        ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, ""), res);
    }
}

module.exports.subcribe = subcribe;
module.exports.publish = publish;