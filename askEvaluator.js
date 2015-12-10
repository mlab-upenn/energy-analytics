/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */
var https = require('https');
var http = require('http');
var Forecast = require('forecast');
var plotly = require('plotly')('ssamarth','rjt9ukhxlf');
var express    = require("express");
var mysql      = require('mysql');
var app = express();
app.listen(4000);

var connection = mysql.createConnection({
	  host     : 'cis550-movie-junkies-mysql-instance.cuzkvenhnm4n.us-east-1.rds.amazonaws.com',
	  user     : 'cis550',
	  password : 'iamamoviejunkie',
	  database : 'Movie_Database',
	  acquireTimeout: 1000000
	});
	
connection.connect(function(err){
	if(!err) {
		console.log("connecting first time");
		console.log("Database is connected ... \n\n");
	} else {
		console.log("not connecting first time");
		console.log("Error connecting database ... \n\n");
	}
	});
/**
 * URL prefix to download history content from Wikipedia
 */
 
var baseLineConsumption = 1500000;
var urlPrefix = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext=&exsectionformat=plain&redirects=&titles=';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
		console.log("**************************STARTING********************");
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(context, event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse)
					 {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
					}
					);
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                // + ", sessionId=" + session.sessionId);
	console.log("Session Started");
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    // console.log("onLaunch requestId=" + launchRequest.requestId
                // + ", sessionId=" + session.sessionId);
	console.log("On launch");			

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(context, intentRequest, session, callback) {
    //console.log("onIntent requestId=" + intentRequest.requestId
    //            + ", sessionId=" + session.sessionId);

	console.log("On Intent");	
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
	console.log("intent is= " + intent + " and intent Name is= " + intentName);
    // Dispatch to your skill's intent handlers
    if ("ChoiceIntent" === intentName) 
	{
        askEvaluator(context, intent, session, callback, "0");
    } 
	else if ("OpenEndedOptionOneIntent" === intentName) 
	{
        directToOptionOne(context, intent, session, callback);
    }
	else if ("OpenEndedOptionTwoIntent" === intentName) 
	{
        directToOptionTwo(context, intent, session, callback);
    }
	else if ("RepeatIntent" === intentName) 
	{
        repeat(context, intent, session, callback);
    }
	else if ("CustomOptionIntent" === intentName) 
	{
        getCustomSetPoint(context, intent, session, callback);
    } 	
	else if ("ChangeSetpointIntent" === intentName) 
	{
        changeSetPoint(context, intent, session, callback);
    } 
	else if ("WeatherIntent" === intentName) 
	{
        getWeather(context, intent, session, callback);
    } 	
	else if ("CantUnderstandIntent" === intentName) 
	{
        getHelp(callback);
    }
	else if ("HelpIntent" === intentName) 
	{
        getHelp(callback);
    }
	else if ("FinishIntent" === intentName) 
	{
        finish(callback);
    } 
	else 
	{
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) 
{
	console.log("On Session END");	
}

function getWelcomeResponse(callback) 
{
	var sessionAttributes = {};
    var cardTitle = "Hello guys";
	var speechOutput = "Hello! Welcome to our project Prashna's D R Evaluator. You may start with your questions now. ";
    var repromptText = "You may begin asking questions now. You may also say help in order to know in detail about the available options";
	//feedDB(speechOutput, 0, 4);
	connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 4 +')', function(err, rows, fields) 
	{
		console.log(err);
		if(!err)
		{
			var shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
			console.log('Successful insertion of data into Database');
		}
		else
		{
			console.log('Error during insertion of data into Database');
		}
	});
}

function feedDB(speechOutput, plot_id, intentNum)
{
	console.log("inside feed db");
	connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+parseInt(plot_id)+','+ intentNum +')', function(err, rows, fields) 
	{
		console.log(err);
		if(!err)
		{
			console.log('Successful insertion of data into Database');
		}
		else
		{
			console.log('Error during insertion of data into Database');
		}
	});
}
function askEvaluator(context, intent, session, callback, option) 
{
    var cardTitle = intent.name;
	var optionNumber;
	if(option == "0")
		optionNumber = intent.slots.optionNumber.value;
	else
		optionNumber = option;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
	//callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
	
	if(!(isNaN(optionNumber)))
	{
		if(optionNumber > 0 && optionNumber < 4)
		{
			console.log("option number is: ");
			console.log(optionNumber);
			switch (optionNumber)
			{
				case "1":
					speechOutput = "Performing analysis ";
					var strategy1 = [0.6, 26, 9];
					var strategy2 = [0.6, 26, 8];
					var strategy3 = [0.8, 26, 9];
					console.log("Performing analysis ");
					speechOutput = "Performing analysis ";
					//callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					getResponseFromServer(1, [strategy1[0], strategy1[1], strategy1[2], strategy2[0], strategy2[1], strategy2[2], strategy3[0], strategy3[1], strategy3[2]], function(response) 
					{
						console.log("after receiving is: " + response);
						var answer = response.split("~");
						var lowestOutput;
						var bestStrategy;
						var plotUrlParsed;
						var plot_id = answer[6];
						if(answer[1] <= answer[3] && answer[1] <= answer[5])
						{
							lowestOutput = parseFloat(answer[1]);
							bestStrategy = parseInt(answer[0]);
						}
						else if(answer[3] < answer[1] && answer[3] < answer[5])
						{
							lowestOutput = parseFloat(answer[3]);
							bestStrategy = parseInt(answer[2]);
						}
						else if(answer[5] < answer[1] && answer[5] < answer[3])
						{
							lowestOutput = parseFloat(answer[5]);
							bestStrategy = parseInt(answer[4]);
						}
						console.log(lowestOutput);
						if(bestStrategy == 1)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy1[0]*100 + " percent, zone temperature of " + strategy1[1] + " degree celsius, and chilled water temperature of " + strategy1[2] + " degree celsius, and it leads to a power consumption of " + (lowestOutput / 1000000).toFixed(2) + " mega watts.";
						else if(bestStrategy == 2)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy2[0]*100 + " percent, zone temperature of " + strategy2[1] + " degree celsius, and chilled water temperature of " + strategy2[2] + " degree celsius, and it leads to a power consumption of " + (lowestOutput / 1000000).toFixed(2) + " mega watts.";
						else if(bestStrategy == 3)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy3[0]*100 + " percent, zone temperature of " + strategy3[1] + " degree celsius, and chilled water temperature of " + strategy3[2] + " degree celsius, and it leads to a power consumption of " + (lowestOutput / 1000000).toFixed(2) + " mega watts.";
						var curtailment;
						if(lowestOutput < baseLineConsumption)
						{
							curtailment = baseLineConsumption - lowestOutput;
							speechOutput += " You have a curtailment of " + (curtailment / 1000).toFixed(2) + " killo watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
							shouldEndSession = false;
							// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
						}
						else
						{
							curtailment = lowestOutput - baseLineConsumption;
							speechOutput += " You have an increment by " + (curtailment / 1000).toFixed(2) + " killo watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
						}
						console.log("the best strategy is: " + bestStrategy + " and it leads to a power consumption of " + (curtailment / 1000).toFixed(2) + " killo watts");
						//feedDB(speechOutput, parseInt(plot_id), 7);
						connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ parseInt(plot_id) +','+ 7 +')', function(err, rows, fields) 
						{
							console.log(err);
							if(!err)
							{
								var shouldEndSession = false;
								callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
								console.log('Successful insertion of data into Database');
							}
							else
							{
								console.log('Error during insertion of data into Database');
							}
						});
					});
					break;
				case "2":
					speechOutput = "You selected the custom strategy option. You will now mention the values for the 3 set points: lighting, zone temperature, and chilled water temperature. Please tell me the value of lighting. Lighting should be greater than 50 percent during D R event in order to obtain best results. You may say, lighting is 70 percent. ";
					repromptText = "Please tell me the value of lighting. The lighting should be greater than 50 percent during a D R event in order to obtain best results. You may say, lighting is 70 percent. ";
					connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 1 +')', function(err, rows, fields) 
					{
						console.log(err);
						if(!err)
						{
							var shouldEndSession = false;
							callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
							console.log('Successful insertion of data into Database');
						}
						else
						{
							console.log('Error during insertion of data into Database');
						}
					});
					break;
				case "3":
					speechOutput = "Which set point would you like to change? And by how much would you like to change it? You may say, I want to change lighting to 90 percent. ";
					repromptText = "Which set point would you like to change? ";
					connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 6 +')', function(err, rows, fields) 
					{
						console.log(err);
						if(!err)
						{
							var shouldEndSession = false;
							callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
							console.log('Successful insertion of data into Database');
						}
						else
						{
							console.log('Error during insertion of data into Database');
						}
					});
					break;
				default: 
					speechOutput = "default option number";
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					break;
			}
		}
		else
		{
			speechOutput = "The option number you mentioned is beyond the range. Please mention an option number between 1 and 3. ";
			repromptText = speechOutput;
			connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 2 +')', function(err, rows, fields) 
			{
				console.log(err);
				if(!err)
				{
					var shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
					console.log('Successful insertion of data into Database');
				}
				else
				{
					console.log('Error during insertion of data into Database');
				}
			});
		}
	}
	else
	{
		speechOutput = " I could not understand your phrasing properly, please try again.";
		repromptText = "I could not understand your phrasing properly, please try again.";
		connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 1 +')', function(err, rows, fields) 
		{
			console.log(err);
			if(!err)
			{
				var shouldEndSession = false;
				callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
				console.log('Successful insertion of data into Database');
			}
			else
			{
				console.log('Error during insertion of data into Database');
			}
		});
	}
	
}

function getCustomSetPoint(context, intent, session, callback) 
{
    var cardTitle = intent.name;
	var setPtType = intent.slots.setpointType.value;
	var setPtValue = intent.slots.setPointValue.value;
	var lightingSetPtValue;
	var zoneAirTempSetPtValue;
	var chilledWaterTempSetPtValue;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = " inside get custom set point";
	console.log("type is: " + setPtType);
	if(setPtType == "lighting" || setPtType == "zone temperature" || setPtType == "cold water temperature" || setPtType == "chilled water temperature")
	{
		if(setPtType == "lighting")
		{
			console.log("lighting set point value is: " + setPtValue);
			if(setPtValue >= 0 && setPtValue <= 100)
			{
				sessionAttributes = createCustomSetPointAttributes(setPtValue, "", "");
				speechOutput = "You have successfully set lighting to " + sessionAttributes.lightingValue + ". Now, please tell me the value of zone temperature. Zone temperature should be between 25 to 29 degree celsius to obtain best results. You can say, zone temperature is 27 degree celsius";
				repromptText = speechOutput;
				// shouldEndSession = false;
				// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
			}
			else
			{
				speechOutput = "The lighting value you mentioned is out of range. It should be between 0 to 100 percent. Please tell me the value of lighting again. Lighting should be greater than 50 percent during a D R event in order to obtain best results. You may say, lighting is 70 percent. ";
				repromptText = speechOutput;
				// shouldEndSession = false;
				// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
			}
			//feedDB(speechOutput, 0, 1);
			connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 1 +')', function(err, rows, fields) 
			{
				console.log(err);
				if(!err)
				{
					var shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
					console.log('Successful insertion of data into Database');
				}
				else
				{
					console.log('Error during insertion of data into Database');
				}
			});
		}
		else if(setPtType == "zone temperature")
		{
			if(setPtValue >= 25 && setPtValue <= 29)
			{
				sessionAttributes = session.attributes;
				lightingSetPtValue = sessionAttributes.lightingValue;
				sessionAttributes = createCustomSetPointAttributes(lightingSetPtValue, setPtValue, "");
				speechOutput = "You have successfully set lighting to " + lightingSetPtValue + ", and zone temperature to " + sessionAttributes.zoneAirTempValue + ". Now, please tell me the value of the chilled water temperature. Chilled water temperature should be between 6.5 to 10 degree celsius to obtain best results. You can say, chilled water temperature is 9 degree celsius";
				repromptText = speechOutput;
				// shouldEndSession = false;
				// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
			}
			else
			{
				speechOutput = "Zone temperature value you mentioned is out of range. Please tell me the value of zone temperature. Zone temperature should be between 25 to 29 degree celsius to obtain best results. You can say, zone temperature is 27 degree celsius";
				repromptText = speechOutput;
				// shouldEndSession = false;
				// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
			}
			connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 1 +')', function(err, rows, fields) 
			{
				console.log(err);
				if(!err)
				{
					var shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
					console.log('Successful insertion of data into Database');
				}
				else
				{
					console.log('Error during insertion of data into Database');
				}
			});
		}
		else if(setPtType == "cold water temperature" || setPtType == "chilled water temperature")
		{
			if(setPtValue >= 6 && setPtValue <= 10)
			{
				sessionAttributes = session.attributes;
				lightingSetPtValue = sessionAttributes.lightingValue;
				zoneAirTempSetPtValue = sessionAttributes.zoneAirTempValue;
				chilledWaterTempSetPtValue = setPtValue;
				sessionAttributes = createCustomSetPointAttributes(lightingSetPtValue, zoneAirTempSetPtValue, setPtValue);
				getResponseFromServer(2, [lightingSetPtValue/100, zoneAirTempSetPtValue, chilledWaterTempSetPtValue], function(response) 
				{
					var answer = response.split("~");
					var plot_id = answer[1];
					var curtailment;
					console.log("after receiving is: " + answer[0]);
					if(answer[0] < baseLineConsumption)
					{
						curtailment = baseLineConsumption - answer[0];
						speechOutput = "The predicted value of the power consumption of the building using your strategy is " + (answer[0] / 1000000).toFixed(2) + " mega watts. You have a curtailment of " + (curtailment / 1000).toFixed(2) + " killo watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
						// shouldEndSession = false;
						// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					}
					else
					{
						curtailment = answer[0] - baseLineConsumption;
						speechOutput = "The predicted value of the power consumption of the building using your strategy is " + (answer[0] / 1000000).toFixed(2) + " mega watts. You have an increment by " + (curtailment / 1000).toFixed(2) + " killo watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
					}
					connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ parseInt(plot_id) +','+ 0 +')', function(err, rows, fields) 
					{
						console.log(err);
						if(!err)
						{
							var shouldEndSession = false;
							callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
							console.log('Successful insertion of data into Database');
						}
						else
						{
							console.log('Error during insertion of data into Database');
						}
					});
				});	
			}
		}
	}
	else
	{
		sessionAttributes = session.attributes;
		speechOutput = "I could not understand the type of set point you want to set. Please try again.";
		repromptText = speechOutput;
		connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 1 +')', function(err, rows, fields) 
		{
			console.log(err);
			if(!err)
			{
				var shouldEndSession = false;
				callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
				console.log('Successful insertion of data into Database');
			}
			else
			{
				console.log('Error during insertion of data into Database');
			}
		});
	}
}

function changeSetPoint(context, intent, session, callback) 
{
	var cardTitle = intent.name;
	var setPtType = intent.slots.setpointType.value;
	var setPtValue = intent.slots.setPointValue.value;
	var lightingSetPtValue = 60;
	var zoneAirTempSetPtValue = 26;
	var chilledWaterTempSetPtValue = 9;
	if(setPtType == "lighting")
	{
		lightingSetPtValue = setPtValue;
	}
	else if(setPtType == "zone temperature")
	{
		zoneAirTempSetPtValue = setPtValue;
	}
	else if(setPtType == "cold water temperature" || setPtType == "chilled water temperature")
	{
		chilledWaterTempSetPtValue = setPtValue;
	}
	getResponseFromServer(3, [lightingSetPtValue/100, zoneAirTempSetPtValue, chilledWaterTempSetPtValue], function(response) 
	{
		var curtailment;
		var answer = response.split("~");
		var plot_id = answer[1];
		if(answer[0] < baseLineConsumption)
		{
			curtailment = baseLineConsumption - answer[0];
			speechOutput = "The predicted value of the power consumption of the building is " + (answer[0] / 1000000).toFixed(2) + " mega watts. You have a curtailment of " + (curtailment / 1000).toFixed(2) + " killo watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
			// shouldEndSession = false;
			// callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
		}
		else
		{
			curtailment = answer[0] - baseLineConsumption;
			speechOutput = "The predicted value of the power consumption of the building is " + answer[0] + " watts. You have an increment by " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
		}
		connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ parseInt(plot_id) +','+ 0 +')', function(err, rows, fields) 
		{
			console.log(err);
			if(!err)
			{
				var shouldEndSession = false;
				callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
				console.log('Successful insertion of data into Database');
			}
			else
			{
				console.log('Error during insertion of data into Database');
			}
		});
	});	
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = " inside get custom set point";
	console.log("type is: " + setPtType);
}

function directToOptionOne(context, intent, session, callback)
{
	var cardTitle = intent.name;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    console.log("Best strategy query");
	askEvaluator(context, intent, session, callback, "1") 
}
function directToOptionTwo(context, intent, session, callback)
{
	var cardTitle = intent.name;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    console.log("Best strategy query");
	askEvaluator(context, intent, session, callback, "2") 
}

// function getWeather(context, intent, session, callback)
// {
	// var cardTitle = intent.name;
    // var repromptText = "";
	// var sessionAttributes = {};
    // var shouldEndSession = false;
    // var speechOutput = " obtaining weather";
	//Initialize 
	// var forecast = new Forecast
	// ({
	  // service: 'forecast.io',
	  // key: 'b96daaa30fd5aadaa4b74d400eabef03',
	  // units: 'celcius', // Only the first letter is parsed 
	  // cache: true,      // Cache API requests? 
	  // ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
		// minutes: 27,
		// seconds: 45
		// }
	// });
	 
	//Retrieve weather information from coordinates (Sydney, Australia) 
	// forecast.get([-33.8683, 151.2086], function(err, weather) 
	// {
	  // if(err) return console.log(err);
	  // temperature = weather.currently.temperature;
	  // console.log(weather.currently.temperature);
	// });
	// speechOutput("Current Temperature in Sydney is " + temperature + " degree celsius");
// }
function createCustomSetPointAttributes(lightingSetPoint, zoneAirTempSetPoint, chilledWaterTempSetPoint) {
    return {
        lightingValue: lightingSetPoint,
		zoneAirTempValue: zoneAirTempSetPoint,
		chilledWaterTempValue: chilledWaterTempSetPoint
    };
}
function getResponseFromServer(option, customStrategy, eventCallBack)
{
	var serverURL;
	if(option == 1)
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:3000/?identifier=evaluator&optionNum=" + option +"&lighting1=" + customStrategy[0] + "&zoneTemp1=" + customStrategy[1] + "&chilledWaterTemp1=" + customStrategy[2] + "&lighting2=" + customStrategy[3] + "&zoneTemp2=" + customStrategy[4] + "&chilledWaterTemp2=" + customStrategy[5] + "&lighting3=" + customStrategy[6] + "&zoneTemp3=" + customStrategy[7] + "&chilledWaterTemp3=" + customStrategy[8];
	else if(option == 2)
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:3000/?identifier=evaluator&optionNum=" + option +"&lighting1=" + customStrategy[0] + "&zoneTemp1=" + customStrategy[1] + "&chilledWaterTemp1=" + customStrategy[2];
	else if(option == 3)
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:3000/?identifier=evaluator&optionNum=" + option +"&lighting1=" + customStrategy[0] + "&zoneTemp1=" + customStrategy[1] + "&chilledWaterTemp1=" + customStrategy[2];
	var body = '';
	http.get(serverURL, function(res) 
	{	
		console.log("making a request to the server");
		res.on('data', function (chunk) 
		{
			body += chunk;
		});
		res.on('end', function () 
		{
			console.log("response received: " + body);
			eventCallBack(body);
		});
	}).on('error', function (e) 
	{
		console.log("Got error: ", e);
	});
	console.log("helllloooooooo\n");
}

function repeat(context, intent, session, callback) {
	
	var sessionAttributes = {};
	var cardTitle = "Repeating the options";
	var speechOutput = "I can provide you with a few options to select from. Option one: I can perform analysis on 3 pre determined strategies, and can advise you the best one based on the current conditions. Option 2: you may recommend your own new strategy and provide me with your custom setpoint values. Option 3: you may ask for a change in a particular setpoint value and I can evaluate and inform you about the impact it has on the power consumption. In order to select one of these options, you may say, select option 2, or, choose option 1, or you may ask me to repeat the options";
	var repromptText = speechOutput;
	connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 0 +')', function(err, rows, fields) 
	{
		console.log(err);
		if(!err)
		{
			var shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
			console.log('Successful insertion of data into Database');
		}
		else
		{
			console.log('Error during insertion of data into Database');
		}
	});
}

function getHelp(callback) {
	
	var sessionAttributes = {};
	var cardTitle = "Providing Help";
	var speechOutput = "D R Evaluator evaluates the power consumption of various buildings across Penn campus. It can also provide advises to curtail the power consumption based on different strategies. I can provide you with a few options to select from. Option one: I can perform analysis on 3 pre determined strategies, and can advise you the best one based on the current conditions. Option 2: you may recommend your own new strategy, and provide me with your custom set point values. Option 3: you may ask for a change in a particular set point value, and I can evaluate and inform you about the impact it has on the power consumption. In order to select one of these options, you may say, select option 2, or, choose option 1, or you may ask me to repeat the options";
	var repromptText = "I did not understand what you are trying to say, please ask me again, ";
	connection.query('INSERT INTO `RTES` (ALEXA, URL_ID, INTENT_NUM) VALUES ("'+speechOutput+'",'+ 0 +','+ 7 +')', function(err, rows, fields) 
	{
		console.log(err);
		if(!err)
		{
			var shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
			console.log('Successful insertion of data into Database');
		}
		else
		{
			console.log('Error during insertion of data into Database');
		}
	});
}

function finish(callback) 
{
	var sessionAttributes = {};
	var cardTitle = "Exiting advisor";
	var speechOutput = "I hope you had a wonderful time interacting with me and got all the answers to your questions, GoodBye and have a nice day!"
	var repromptText = "I did not understand what you are trying to say, please ask me again, ";
	var shouldEndSession = true;
	connection.end();
	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
		sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}