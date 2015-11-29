/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */
var https = require('https');
var http = require('http');
/**
 * URL prefix to download history content from Wikipedia
 */
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
    if ("ConditionIntent" === intentName) 
	{
        askAdvisor(context, intent, session, callback);
    } 
	else if (intentName === "SpecificCondIntent") 
	{
        askSpecificCondition(context, intent, session, callback);
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
function onSessionEnded(sessionEndedRequest, session) {
    // console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                // + ", sessionId=" + session.sessionId);
	console.log("On Session END");	
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
	var sessionAttributes = {};
    var cardTitle = "Hello guys";
    var speechOutput = "Hello! Welcome to our project Prashna's D R Advisor. "
                 + " You can ask for the status of various buildings across Penn campus. ";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "I did not understand what you are trying to say, please ask me again. ";
    var shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getHelp(callback) {
	
	var sessionAttributes = {};
	var cardTitle = "Providing Help";
	var speechOutput = "Advisor skill set allows you to ask me about status of various Penn buildings across the campus, You can ask me questions like, under what conditions does college hall consume more than ninety killo watt, I can specifically tell you about day of the month, time of the day, temperature, wind gusts, solar index and so on,"
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
 
function askSpecificCondition(context, intent, session, callback) {
	var cardTitle = intent.name;
    var condition = intent.slots.condition.value;
    var repromptText = null;
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = "";
	var response;
	var buildingName;
	var compareType;
	var powerValue;
	
	console.log("inside askSpecificCondition");
	
	if(session.attributes) 
	{
		console.log("session attributes present");
        response = session.attributes.allConditions;
		buildingName = session.attributes.buildingName;
		compareType = session.attributes.compare;
		powerValue = session.attributes.power;
    }
	
	if(response && buildingName && compareType && powerValue)
	{
		switch (condition)
		{
			case "day of the month":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts on day " + response[0] + " of the month";
				break;
			case "day of month":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts on day " + response[0] + " of the month";
				break;
			case "time of the day":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at " + response[1] + " hours of the day";
				break;
			case "time of day":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at " + response[1] + " hours of the day";
				break;
			case "temperature":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at an average temperature of " + response[2] + " degree celsius";
				break;
			case "solar index":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at average solar index of " + response[3];
				break;
			case "wind speed":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at an average wind speed of " + response[4];
				break;
			case "gusts":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at an average gust of " + response[5];
				break;
			case "humidity":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at an average humidity of " + response[6];
				break;
			case "dew point":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts at average dew point of " + response[7];
				break;
			case "all":
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts on day " + response[0] + " of the month, at " + response[1] + " hours of the day, at an average temperature of " + response[2] + " degree celsius, at average solar index of " + response[3] + ", at an average wind speed of " + response[4] + ", at an average gust of " + response[5] + ", at average humidity of " + response[6] + ", at average dew point of " + response[7] + ", ";
				break;
			default:
				speechOutput = buildingName + " consumes " + compareType + " than " + powerValue + " killo watts on day " + response[0] + " of the month, at " + response[1] + " hours of the day, at an average temperature of " + response[2] + " degree celsius, at average solar index of " + response[3] + ", at an average wind speed of " + response[4] + ", at an average gust of " + response[5] + ", at average humidity of " + response[6] + ", at average dew point of " + response[7] + ", ";
				break;
		}
	}
	else
		speechOutput = "I am not sure what you are asking for";
	
	callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function askAdvisor(context, intent, session, callback) {
    var cardTitle = intent.name;
	var buildingName = intent.slots.building.value;
	var compareType = intent.slots.compare.value;
	var powerValue = intent.slots.value.value;
    var repromptText = "";
	var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
	//callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
	
	if(buildingName == "college hall" || buildingName == "college on" || buildingName == "huntsman hall" || buildingName == "houston hall " || buildingName == "levine hall" || buildingName == "levine hall" || buildingName == "towne building")
	{
		var bin = -1;
		if(powerValue < 37)
			bin = 1;
		else if(powerValue >= 37 && powerValue < 55)
			bin = 2;
		else if(powerValue >= 55 && powerValue < 74)
			bin = 3;
		else if(powerValue >= 74 && powerValue < 92)
			bin = 4;
		else if(powerValue >= 92 && powerValue < 111)
			bin = 5;
		else
		{
			// ask for a value within a range
			speechOutput = "The power consumption value you mentioned is out of range, please ask for a power value in between 0 to 110 watts";
			repromptText = speechOutput;
			shouldEndSession = false;
			callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
		}
			
		getResponseFromServer(bin, function(response) 
		{
			sessionAttributes = createAllConditionAttributes(response, buildingName, compareType, powerValue);
			speechOutput = "Which specific condition you would want to know about, You can know about conditions like day of the month, time of the day, temperature, solar index, wind speed, gusts, humidity and dew point, for example you can ask, tell me specifically about temperature or, tell me about all the conditions, ";
			repromptText = speechOutput;
			shouldEndSession = false;
			
			callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
		});	
		//console.log("building: " + buildingName + " compare type: " + compareType + " powerValue: " + powerValue); 
	}
	else
	{
		speechOutput = " I could not understand your phrasing properly or, the building name you asked for is not present in my database, please try again, ";
		repromptText = "I could not understand your phrasing properly or, the building name you asked for is not present in my database, please try again, ";
		shouldEndSession = false;
		callback(sessionAttributes, buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
	}
}

function createAllConditionAttributes(allCondition, building, compareType, powerValue) {
    return {
        allConditions: allCondition,
		buildingName: building,
		compare: compareType,
		power: powerValue
    };
}
function getResponseFromServer(binNumber, eventCallBack)
{
	//var url1 = "http://www.stackoverflow.com";
	var serverURL = "http://ec2-54-86-96-236.compute-1.amazonaws.com:9000/?advisor~" + binNumber;
	var body = '';
	//https.get(url, function(res)
	http.get(serverURL, function(res) 
	{	
		res.on('data', function (chunk) 
		{
			body += chunk;
		});
		res.on('end', function () 
		{
			console.log(body);
			var bodyArray = body.split(" ");
			// context.succeed(buildResponse(speechOutput));
			//eventCallBack("SAM IS GREAT");
			eventCallBack(bodyArray);
		});
	}).on('error', function (e) 
	{
		console.log("Got error: ", e);
	});
	console.log("helllloooooooo\n");
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