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

app.get('/response/:id', function(req, res) {
  if(!req.params || !req.params.id) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

  dbResp.getMailResponsesById(req.params.id,res);
});

app.get('/response/:event', function(req, res) {
  if(!req.params || !req.params.event) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

  dbResp.getMailResponsesById(req.params.id,res);
});

app.post('/response', function(req, res) {
  if(!req.body || !req.body.signature) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);

  dbResp.saveMailResponse(req.body,res);
});

app.post('/subscribe', function(req, res){
  if(!req.body) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  
  notify.subcribe(new subType.subscriptionType(req.body.Protocol, req.body.Topic, req.body.Endpoint), res);
});

app.post('/notification', function(req, res){
  if(!req.body) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload", false, "", false, null), res);
  
  res.send();
  console.log(req.body);
});

app.post('/setup', function(req, res){
  if(!req.body) ret.cleanResponse(new respObj.responseApi(true, "Empty Payload. Environment variables not set", false, "", false, null), res);
  
  ret.cleanResponse(notify.setUp(new setit.setitup(req.body.Port, req.body.AwsARn, req.body.MailgunSignKey)), res);
});

app.listen(process.env.PORT, function() {
    console.log("Receece challenge started on PORT " + process.env.PORT)
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
