/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */
var https = require('https');
var http = require('http');
//var Forecast = require('forecast');
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
        askEvaluator(context, intent, session, callback);
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
function onSessionEnded(sessionEndedRequest, session) {
    // console.log("onSessionEnded r-equestId=" + sessionEndedRequest.requestId
                // + ", sessionId=" + session.sessionId);
	console.log("On Session END");	
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) 
{
    // If we wanted to initialize the session to have some attributes we could add those here.
	var sessionAttributes = {};
    var cardTitle = "Hello guys";
    var speechOutput = "Hello! Welcome to our project Prashna's D R Evaluator.  "
                + " D R Evaluator evaluates the power consumption of various buildings across Penn campus. It can also provide advises to curtail the power consumption based on different strategies. I can provide you with a few options to select from. Option one: I can perform analysis on 3 pre determined strategies, and can advise you the best one based on the current conditions. Option 2: you may recommend your own new strategy, and provide me with your custom set point values. Option 3: you may ask for a change in a particular set point value, and I can evaluate and inform you about the impact it has on the power consumption. In order to select one of these options, you may say, select option 2, or, choose option 1, or you may ask me to repeat the options";
	//var speechOutput = "In order to select one of these options, you may say, select option 2, or, choose option 1, or you may ask me to repeat the options";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "I can provide you with a few options to select from. Option one: I can perform analysis on 3 pre determined strategies, and can advise you the best one based on the current conditions. Option 2: you may recommend your own new strategy and provide me with your custom set point values. Option 3: you may ask for a change in a particular set point value and I can evaluate and inform you about the impact it has on the power consumption. In order to select one of these options, you may say, select option 2, or, choose option 1.";
    var shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function askEvaluator(context, intent, session, callback) 
{
    var cardTitle = intent.name;
	var optionNumber = intent.slots.optionNumber.value;
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
					getResponseFromServer(1, [strategy1[0], strategy1[1], strategy1[2], strategy2[0], strategy2[1], strategy2[2], strategy3[0], strategy3[1], strategy3[2]], function(response) 
					{
						console.log("after receiving is: " + response);
						if(response[0] == 1)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy1[0]*100 + " percent, zone air temperature of " + strategy1[1] + " degree celsius, and cold water temperature of " + strategy1[2] + " degree celsius and it leads to a power consumption of " + response[1] + " watts.";
						else if(response[0] == 2)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy2[0]*100 + " percent, zone air temperature of " + strategy2[1] + " degree celsius, and cold water temperature of " + strategy2[2] + " degree celsius and it leads to a power consumption of " + response[1] + " watts.";
						else if(response[0] == 3)
							speechOutput = "As per my forecast, the best strategy has a lighting of " + strategy3[0]*100 + " percent, zone air temperature of " + strategy3[1] + " degree celsius, and cold water temperature of " + strategy3[2] + " degree celsius and it leads to a power consumption of " + response[1] + " watts.";
						var curtailment;
						if(response[1] < baseLineConsumption)
						{
							curtailment = baseLineConsumption - response[1];
							speechOutput += " You have a curtailment of " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
							shouldEndSession = false;
							callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
						}
						else
						{
							curtailment = response[1] - baseLineConsumption;
							speechOutput += " You have an increment by " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
						}
						console.log("the best strategy is: " + response[0] + " and it leads to a power consumption of " + response[1] + " watts");
						shouldEndSession = false;
						callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					});
					break;
				case "2":
					speechOutput = "You selected the custom strategy option. You will now mention the values for the 3 set points: lighting, zone air temperature, and cold water temperature. Please tell me the value of lighting. Lighting should be greater than 50 percent during D R event in order to obtain best results. You may say, lighting is 70 percent. ";
					repromptText = "Please tell me the value of lighting. The lighting should be greater than 50 percent during a D R event in order to obtain best results. You may say, lighting is 70 percent. ";
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					break;
				case "3":
					speechOutput = "Okay. Which set point would you like to change? And by how much would you like to change it? You may say, I want to change lighting to 90 percent. ";
					repromptText = "Which set point would you like to change? ";
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
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
			shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
		}
	}
	else
	{
		speechOutput = " I could not understand your phrasing properly, please try again.";
		repromptText = "I could not understand your phrasing properly, please try again.";
		shouldEndSession = false;
		callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
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
	if(setPtType == "lighting" || setPtType == "zone air temperature" || setPtType == "cold water temperature" || setPtType == "chilled water temperature")
	{
		switch (setPtType)
		{
			case "lighting":
				console.log("lighting set point value is: " + setPtValue);
				if(setPtValue >= 0 && setPtValue <= 100)
				{
					sessionAttributes = createCustomSetPointAttributes(setPtValue, "", "");
					speechOutput = "You have successfully set lighting to " + sessionAttributes.lightingValue + ". Now, please tell me the value of zone air temperature. Zone air temperature should be between 25 to 29 degree celsius to obtain best results. You can say, zone air temperature is 27 degree celsius";
					repromptText = speechOutput;
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
				}
				else
				{
					speechOutput = "The lighting value you mentioned is out of range. It should be between 0 to 100 percent. Please tell me the value of lighting again. Lighting should be greater than 50 percent during a D R event in order to obtain best results. You may say, lighting is 70 percent. ";
					repromptText = speechOutput;
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
				}
				break;
			case "zone air temperature":
				if(setPtValue >= 25 && setPtValue <= 29)
				{
					sessionAttributes = session.attributes;
					lightingSetPtValue = sessionAttributes.lightingValue;
					sessionAttributes = createCustomSetPointAttributes(lightingSetPtValue, setPtValue, "");
					speechOutput = "You have successfully set lighting to " + lightingSetPtValue + ", and zone air temperature to " + sessionAttributes.zoneAirTempValue + ". Now, please tell me the value of the cold water temperature. Cold water temperature should be between 6.5 to 10 degree celsius to obtain best results. You can say, cold water temperature is 9 degree celsius";
					repromptText = speechOutput;
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
				}
				else
				{
					speechOutput = "Zone air temperature value you mentioned is out of range. Please tell me the value of zone air temperature. Zone air temperature should be between 25 to 29 degree celsius to obtain best results. You can say, zone air temperature is 27 degree celsius";
					repromptText = speechOutput;
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
				}
				break;
			case "cold water temperature":
				if(setPtValue >= 6 && setPtValue <= 10)
				{
					sessionAttributes = session.attributes;
					lightingSetPtValue = sessionAttributes.lightingValue;
					zoneAirTempSetPtValue = sessionAttributes.zoneAirTempValue;
					chilledWaterTempSetPtValue = setPtValue;
					sessionAttributes = createCustomSetPointAttributes(lightingSetPtValue, zoneAirTempSetPtValue, setPtValue);
					//speechOutput = "You have successfully set lighting to " + lightingSetPtValue + ", and zone air temperature to " + zoneAirTempSetPtValue + ", and cold water temperature to " + sessionAttributes.chilledWaterTempValue + ". Now computing your results."; //call to server here
					getResponseFromServer(2, [lightingSetPtValue/100, zoneAirTempSetPtValue, chilledWaterTempSetPtValue], function(response) 
					{
						var curtailment;
						if(response < baseLineConsumption)
						{
							curtailment = baseLineConsumption - response;
							speechOutput = "The predicted value of the power consumption of the building using your strategy is " + response + " watts. You have a curtailment of " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
							shouldEndSession = false;
							callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
						}
						else
						{
							curtailment = response - baseLineConsumption;
							speechOutput = "The predicted value of the power consumption of the building using your strategy is " + response + " watts. You have an increment by " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
						}
						shouldEndSession = false;
						callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
					});	
				}
				else
				{
					speechOutput = "The cold water temperature value you mentioned is out of range. Please tell me the value of the cold water temperature. Cold water temperature should be between 6.5 to 10 degree celsius to obtain best results. You can say, cold water temperature is 9 degree celsius";
					repromptText = speechOutput;
					shouldEndSession = false;
					callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
				}
				break;
		}
	}
	else
	{
		sessionAttributes = session.attributes;
		speechOutput = "I could not understand the type of set point you want to set. Please try again.";
		repromptText = speechOutput;
		shouldEndSession = false;
		callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
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
	else if(setPtType == "zone air temperature")
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
		if(response < baseLineConsumption)
		{
			curtailment = baseLineConsumption - response;
			speechOutput = "The predicted value of the power consumption of the building is " + response + " watts. You have a curtailment of " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
			shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
		}
		else
		{
			curtailment = response - baseLineConsumption;
			speechOutput = "The predicted value of the power consumption of the building is " + response + " watts. You have an increment by " + curtailment + " watts than the baseline consumption. In order to continue, you may say state the options or you may say exit if you want to quit.";
		}
		shouldEndSession = false;
		callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
	});	
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = " inside get custom set point";
	console.log("type is: " + setPtType);
}

function getWeather(context, intent, session, callback)
{
	var cardTitle = intent.name;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = " obtaining weather";
	// Initialize 
	var forecast = new Forecast
	({
	  service: 'forecast.io',
	  key: 'b96daaa30fd5aadaa4b74d400eabef03',
	  units: 'celcius', // Only the first letter is parsed 
	  cache: true,      // Cache API requests? 
	  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
		minutes: 27,
		seconds: 45
		}
	});
	 
	// Retrieve weather information from coordinates (Sydney, Australia) 
	forecast.get([-33.8683, 151.2086], function(err, weather) 
	{
	  if(err) return console.log(err);
	  temperature = weather.currently.temperature;
	  console.log(weather.currently.temperature);
	});
	speechOutput("Current Temperature in Sydney is " + temperature + " degree celsius");
}
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
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:9000/?evaluator~" + option + "~" + customStrategy[0] + "~" + customStrategy[1] + "~" + customStrategy[2] + "~" + customStrategy[3] + "~" + customStrategy[4] + "~" + customStrategy[5] + "~" + customStrategy[6] + "~" + customStrategy[7] + "~" + customStrategy[8];
	else if(option == 2)
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:9000/?evaluator~" + option + "~" + customStrategy[0] + "~" + customStrategy[1] + "~" + customStrategy[2];
	else if(option == 3)
		serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:9000/?evaluator~" + option + "~" + customStrategy[0] + "~" + customStrategy[1] + "~" + customStrategy[2];
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
			var bodyArray = body.split(" ");
			eventCallBack(bodyArray);
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
	var shouldEndSession = false;
	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getHelp(callback) {
	
	var sessionAttributes = {};
	var cardTitle = "Providing Help";
	var speechOutput = "I did not understand what you are trying to say, please ask me again, ";
	var repromptText = "I did not understand what you are trying to say, please ask me again, ";
	var shouldEndSession = false;
	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function finish(callback) 
{
	var sessionAttributes = {};
	var cardTitle = "Exiting advisor";
	var speechOutput = "I hope you had a wonderful time interacting with me and got all the answers to your questions, GoodBye and have a nice day!"
	var repromptText = "I did not understand what you are trying to say, please ask me again, ";
	var shouldEndSession = true;
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