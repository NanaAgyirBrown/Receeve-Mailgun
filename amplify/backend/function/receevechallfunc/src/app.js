/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_RECEEVECHALLDB_ARN
	STORAGE_RECEEVECHALLDB_NAME
Amplify Params - DO NOT EDIT *//*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

var morganMiddleware = require('./morgan')
const dbResp = require('./helpers/db');
const subType = require('./helpers/subscriptionObj');
const notify = require('./helpers/notifications')
const ret = require('./helpers/returnresponse');
const setit = require('./helpers/setup');
const fs = require('fs-extra')
const respObj = require('./helpers/responseApi');

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(morganMiddleware);
// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

if(!process.env.ENV && process.env.ENV == "NONE") console.log("Set up your environment varialble by post this json with values to the endpoint /setup. Thank you");

app.get('/response', function(req, res) {
  dbResp.getMailResponses(res);
});

app.post('/response/id', function(req, res) {
  if(!req.body || !req.body.id) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  dbResp.getMailResponsesById(req.body.id,res);
});

app.post('/response/event', function(req, res) {
  if(!req.body || !req.body.event) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  dbResp.getMailResponsesByEvent(req.body.event,res);
});

app.post('/response', function(req, res) {
  if(!req.body || !req.body.signature) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

  dbResp.saveMailResponse(req.body,res);
});

app.post('/subscribe', function(req, res){
  if(!req.body) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  
  notify.subcribe(new subType.subscriptionType(req.body.Protocol, req.body.Topic, req.body.Endpoint), res);
});

app.post('/notification', function(req, res){
  if(!req.body) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  console.log(req.body);
  res.send();  
});


app.post('/setup', function(req, res){
  if(!req.body) return ret.cleanResponse(new respObj.responseApi(true, "Empty Payload. Environment variables not set", false, "", false, null), res);

    fs.ensureFile('.env')
    .then(() => {      
      console.log('Environment file checked and created!')
    })
    .catch(err => {
      ret.cleanResponse(new respObj.responseApi(false, "", true, err.message, false, null), res);
    });

    try {
      const crfs = fs.createWriteStream('.env', {
        flags: 'a'
      });

      for(var setvariable in req.body){
        crfs.write("\n" + setvariable +"="+ req.body[setvariable], (err) => {
          if(err) ret.cleanResponse(new respObj.responseApi(true, err.message , false, "", false, ""), res);
        });
      }

      ret.cleanResponse(new respObj.responseApi(false, "", false, "", true, "Environment variables set."), res);
               
    } catch (error) {
        ret.cleanResponse(new respObj.responseApi(false, "", true, error.message, false, ""), res);
    }  
});

var PORT = 0000;

if(!process.env.PORT || process.env.PORT == undefined) PORT = 7000; else PORT = process.env.PORT;

app.listen(PORT, function() {
    console.log("Receece challenge started on PORT " + PORT);
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file

module.exports = app;