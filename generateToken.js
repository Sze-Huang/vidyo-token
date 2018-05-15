//generateToken.js
// serverless part start

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const USERS_TABLE = process.env.USERS_TABLE;

const timestamp = new Date().getTime();

const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
};

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send("Hi sls!");
})

// // Get User endpoint
// app.get('/users/:userId', function (req, res) {
//   const params = {
//     TableName: USERS_TABLE,
//     Key: {
//       userId: req.params.userId,
//     },
//   }

//   dynamoDb.get(params, (error, result) => {
//     if (error) {
//       console.log(error);
//       res.status(400).json({ error: 'Could not get user' });
//     }
//     if (result.Item) {
//       const {userId, name} = result.Item;
//       res.json({ userId, name });
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   });
// })

// Generate token, save variable
app.post('/token_generate', function (req, res) {
	const { key, appID, userName, expiresInSecs } = req.body;
	if (typeof key !== 'string') {
	res.status(400).json({ error: '"key" must be a string' });
	} else if (typeof appID !== 'string') {
	res.status(400).json({ error: '"appID" must be a string' });
	} else if (typeof userName !== 'string') {
	res.status(400).json({ error: '"userName" must be a string' });
	} else if (typeof expiresInSecs !== 'string') {
	res.status(400).json({ error: '"expiresInSecs" must be a string' });
	}
	
	//This is a nodejs script, and requires the following npm packages to run:
	//jssha, btoa and command-line-args

	//WARNING - Token generation should NEVER be done client side (in a browser for
	//example), because then you are exposing your developer key to customers
	/*jshint esversion: 6 */

	jsSHA = require('jssha');
	btoa = require('btoa');
	fs = require('fs');
	// const commandLineArgs = require('command-line-args');
	var tokenGenerated = false;
	var vCardFileSpecified = false;

	// const optionDefinitions = [{
		// name: 'key',
		// type: String
	// }, {
		// name: 'appID',
		// type: String
	// }, {
		// name: 'userName',
		// type: String
	// }, {
		// name: 'vCardFile',
		// type: String
	// }, {
		// name: 'expiresInSecs',
		// type: Number
	// }, {
		// name: 'expiresAt',
		// type: String,
		// multiple: true
	// }, {
		// name: 'help',
		// alias: 'h',
		// type: String
	// }];
	
	
	// const options = commandLineArgs(optionDefinitions);

	function printHelp() {
		console.log("\nThis script will generate a provision login token from a developer key" +
			"\nOptions:" +
			"\n\t--key           Developer key supplied with the developer account" +
			"\n\t--appID         ApplicationID supplied with the developer account" +
			"\n\t--userName      Username to generate a token for" +
			"\n\t--vCardFile     Path to the XML file containing a vCard for the user" +
			"\n\t--expiresInSecs Number of seconds the token will be valid can be used instead of expiresAt" +
			"\n\t--expiresAt     Time at which the token will expire ex: (2055-10-27T10:54:22Z) can be used instead of expiresInSecs" +
			"\n");
		process.exit();
	}

	if ((typeof help !== 'undefined') || (typeof key == 'undefined') || (typeof appID == 'undefined') || (typeof userName == 'undefined')) {
		printHelp();
	}

	if (typeof vCardFile !== 'undefined') {
		vCardFileSpecified = true;
	}

	function checkForVCardFileAndGenerateToken(key, appID, userName, expiresInSeconds) {
		if (vCardFileSpecified) {
			fs.readFile(vCardFile, 'utf8', function(err, data) {
				if (err) {
					return console.log("error reading vCard file " + err);
				}
				console.log("read in the fillowing vCard: " + data);
				generateToken(key, appID, userName, expiresInSeconds, data);
			});
		} else {
			generateToken(key, appID, userName, expiresInSeconds, "");
		}
	}

	var token = "";	
	function generateToken(key, appID, userName, expiresInSeconds, vCard) {
		var EPOCH_SECONDS = 62167219200;
		var expires = Math.floor(Date.now() / 1000) + expiresInSeconds + EPOCH_SECONDS;
		var shaObj = new jsSHA("SHA-384", "TEXT");
		shaObj.setHMACKey(key, "TEXT");
		jid = userName + '@' + appID;
		var body = 'provision' + '\x00' + jid + '\x00' + expires + '\x00' + vCard;
		shaObj.update(body);
		var mac = shaObj.getHMAC("HEX");
		var serialized = body + '\0' + mac;
		token = btoa(serialized);
		console.log("\nGenerated Token: \n" + btoa(serialized) );
		// res.send({msg:token});
	}

	//Date is in the format: "October 13, 2014 11:13:00"
	function generateTokenExpiresOnDate(key, appID, userName, date) {
		var currentDate = new Date(date);
		var dateInSeconds = Math.floor(currentDate.valueOf() / 1000);
		var nowInSeconds = Math.floor(Date.now() / 1000);
		if (dateInSeconds < nowInSeconds) {
			console.log("Date is before current time, so token will be invalid");
			expiresInSeconds = 0;
		} else {
			expiresInSeconds = dateInSeconds - nowInSeconds;
			console.log("Expires in seconds: " + expiresInSeconds);
		}
		checkForVCardFileAndGenerateToken(key, appID, userName, expiresInSeconds);
	}

	console.log("\nGenerating token with the following inputs");
	console.log("Key: " + key);
	console.log("appID: " + appID);
	console.log("userName: " + userName);

	if (typeof vCardFile !== 'undefined') {
		console.log("vCardFile: " + vCardFile);
	}

	if (typeof expiresInSecs !== 'undefined') {
		console.log("expiresInSecs: " + expiresInSecs);
		checkForVCardFileAndGenerateToken(key, appID, userName, expiresInSecs);

	} else if (typeof expiresAt !== 'undefined') {
		console.log("expiresAt: " + expiresAt);
		generateTokenExpiresOnDate(key, appID, userName, expiresAt);
	} else {
		console.log("Error: Neither expiresInSecs or expiresAt parameters passed in");
	}	
	
  const params = {
    TableName: USERS_TABLE,
    Item: {
      appID: appID,
	  userName: userName,
	  timestamp: timestamp,
      token: token,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not generate token' });
    }
    res.json({ key, appID, userName, token });
  });
  
})


module.exports.handler = serverless(app);