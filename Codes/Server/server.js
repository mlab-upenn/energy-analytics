var express    = require("express");
var mysql      = require('mysql');
var exec = require('child_process').exec;
var plotly = require('plotly')('ssamarth','rjt9ukhxlf');
var Forecast = require('forecast');

var forecastVector = new Forecast
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

var app = express();
var url = require('url');
function makePlot(lighting1, zoneTemp1, chilledWaterTemp1, strip1, lighting2, zoneTemp2, chilledWaterTemp2, strip2, lighting3, zoneTemp3, chilledWaterTemp3, strip3, callback)
{
	console.log("inside make plot");
	var powerStrategy1 = {y: [strip1], type: "bar", name: "Strategy 1", 
		text: ["STRATEGY 1: \n Lighting: " + lighting1 + "%\nZone Temperature: " + zoneTemp1 + "celsius\nChilled water Temperature: " + chilledWaterTemp1 + " celsius"], 
	};
	var powerStrategy2 = {y: [strip2], type: "bar", name: "Strategy 2", 
		text: ["STRATEGY 2: \n Lighting: " + lighting2 + "%\nZone Temperature: " + zoneTemp2 + "celsius\nChilled water Temperature: " + chilledWaterTemp2+ " celsius"], 
	};
	var powerStrategy3 = {y: [strip3], type: "bar", name: "Strategy 3", 
		text: ["STRATEGY 3: \n Lighting: " + lighting3 + "%\nZone Temperature: " + zoneTemp3 + "celsius\nChilled water Temperature: " + chilledWaterTemp3 + " celsius"], 
	};
	var baseline = {y: [1500000], type: "bar", name: "Baseline", 
		text: ["BASELINE: \n Lighting: 100%\nZone Temperature: 29 celsius\nChilled water Temperature: 6.5 celsius"], 
	};
	var data = [powerStrategy1, powerStrategy2, powerStrategy3, baseline];
	var graphOptions = {filename: "line", fileopt: "overwrite"};
	console.log("forming graph");
	plotly.plot(data, graphOptions, function (err, msg) {
		plotUrlParsed = msg.url.split("~ssamarth/");
		plot_id = plotUrlParsed[1];
		//plot_id = 113;
		callback(plot_id);
		console.log("plot id is: " + plot_id);
	});
}

function makePlot2(lighting1, zoneTemp1, chilledWaterTemp1, strip1, callback)
{
	console.log("inside make plot");
	var powerStrategy1 = {y: [strip1], type: "bar", name: "Strategy 1", 
		text: ["STRATEGY 1: \n Lighting: " + lighting1 + "%\nZone Temperature: " + zoneTemp1 + "celsius\nChilled water Temperature: " + chilledWaterTemp1 + " celsius"], 
	};
	var baseline = {y: [1500000], type: "bar", name: "Baseline", 
		text: ["BASELINE: \n Lighting: 100%\nZone Temperature: 29 celsius\nChilled water Temperature: 6.5 celsius"], 
	};
	var data = [powerStrategy1, baseline];
	var graphOptions = {filename: "line", fileopt: "new"};
	console.log("forming graph");
	plotly.plot(data, graphOptions, function (err, msg) {
		plotUrlParsed = msg.url.split("~ssamarth/");
		plot_id = plotUrlParsed[1];
		//plot_id = 113;
		callback(plot_id);
		console.log("plot id is: " + plot_id);
	});
}
var speech;
app.get("/",function(req,response) 
{
	var url_parts = url.parse(req.url,true);
	var identifier = url_parts.query.identifier;
	var binNumber = url_parts.query.binNumber;
	var optionNum = url_parts.query.optionNum;
	var lighting1 = url_parts.query.lighting1;
	var zoneTemp1 = url_parts.query.zoneTemp1;
	var chilledWaterTemp1 = url_parts.query.chilledWaterTemp1;
	var lighting2 = url_parts.query.lighting2;
	var zoneTemp2 = url_parts.query.zoneTemp2;
	var chilledWaterTemp2 = url_parts.query.chilledWaterTemp2;
	var lighting3 = url_parts.query.lighting3;
	var zoneTemp3 = url_parts.query.zoneTemp3;
	var chilledWaterTemp3 = url_parts.query.chilledWaterTemp3;
	var buildingType = url_parts.query.buildingType;
	//console.log(url_parts);
	if(identifier != null)
	{
		if(identifier == "advisor")
		{
			console.log("inside advisor");
			if(optionNum == 1)
			{
				var child = exec('searchbin.exe ' + binNumber, function( error, stdout, stderr) 
			   {
				   if ( error != null ) 
				   {
						console.log(stderr);
				   }
				   else
				   {
					  if(stdout != null)
					   {
							// console.log(stdout);
							var strip = stdout.split("values: [");
							var output = strip[1].split(']');
							console.log(output[0]);
							response.write(output[0]);
							response.end();
					   }
					   else
					   {
							console.log("null output received");
							response.write("null output received");
							response.end();
					   } 
				   }
			   });
			}
			else if(optionNum == 2)
			{
				forecastVector.get([39.9500, -75.1667], function(err, weather) //Philadelphia co ordinates
				{
					console.log("got weather");
					if(err) return console.log(err);
					
					var date = new Date();
					var dom  = date.getDate();
					var tod = date.getHours();
					var tempC = weather.currently.temperature;
					var solar = 0.5;
					var occ = 720;
					var mon = date.getMonth() + 1;
					var windspeed = weather.currently.windSpeed;
					var windDir = weather.currently.windBearing;
					var gusts = 1.3;
					var hum = weather.currently.humidity;
					var dew = weather.currently.dewPoint;
					var hdd = 32;
					var cdd = 32;
					var output1 = -1, output2 = -1, output3 = -1;
					var building1, building2, building3;
					if(buildingType == "office")
					{
						building1 = "CollegeHall";
						building2 = "HuntsmanHall";
						building3 = "VanceHall";
					}
					else if(buildingType == "lab")
					{
						building1 = "DRL";
						building2 = "CRB";
						building3 = "GoddardLabs";
					}
					var child1 = exec('drAdvisor_all.exe ' + building1 + " " + dom + " " + tod + " " + tempC + " " + solar + " " + occ + " " + mon + " " + windspeed + " " + windDir + " " + gusts + " " + hum + " " + dew + " " + hdd + " " + cdd, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
							console.log(stderr);
					   else
					   {
						  if(stdout != null)
						   {
								output1 = parseFloat(stdout.trim());
								console.log("power consumption of " + building1 + " is: " + output1);
								if(output1 != -1 && output2 != -1 && output3 != -1)
								{
									if(buildingType == "office")
										response.write("College hall~" + output1 + "~Huntsman hall~" + output2 + "~Vance hall~" + output3);
									else
										response.write("D R L~" + output1 + "~C R B~" + output2 + "~Goddard Labs~" + output3);
									response.end();
								}
						   }
						   else
						   {
								console.log("null output received");
								response.write("null output received");
								response.end();
						   } 
						}
				   });
				   var child2 = exec('drAdvisor_all.exe ' + building2 + " " + dom + " " + tod + " " + tempC + " " + solar + " " + occ + " " + mon + " " + windspeed + " " + windDir + " " + gusts + " " + hum + " " + dew + " " + hdd + " " + cdd, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
							console.log(stderr);
					   else
					   {
						  if(stdout != null)
						   {
								output2 = parseFloat(stdout.trim());
								console.log("power consumption of " + building2 + " is: " + output2);
								if(output1 != -1 && output2 != -1 && output3 != -1)
								{
									if(buildingType == "office")
										response.write("College hall~" + output1 + "~Huntsman hall~" + output2 + "~Vance hall~" + output3);
									else
										response.write("D R L~" + output1 + "~C R B~" + output2 + "~Goddard Labs~" + output3);
									response.end();
								}
						   }
						   else
						   {
								console.log("null output received");
								response.write("null output received");
								response.end();
						   } 
						}
				   });
				   var child3 = exec('drAdvisor_all.exe ' + building3 + " " + dom + " " + tod + " " + tempC + " " + solar + " " + occ + " " + mon + " " + windspeed + " " + windDir + " " + gusts + " " + hum + " " + dew + " " + hdd + " " + cdd, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
							console.log(stderr);
					   else
					   {
						  if(stdout != null)
						   {
								output3 = parseFloat(stdout.trim());
								console.log("power consumption of " + building3 + " is: " + output3);
								if(output1 != -1 && output2 != -1 && output3 != -1)
								{
									if(buildingType == "office")
										response.write("College hall~" + output1 + "~Huntsman hall~" + output2 + "~Vance hall~" + output3);
									else
										response.write("D R L~" + output1 + "~C R B~" + output2 + "~Goddard Labs~" + output3);
									response.end();
								}
								
						   }
						   else
						   {
								console.log("null output received");
								response.write("null output received");
								response.end();
						   } 
						}
					});
				});
			}
			else
			{
				response.write("bin number is not defined");
				response.end();
			}
		}
		else if(identifier == "evaluator")
		{
			console.log("inside evaluator");
			if(optionNum == 1)
			{
				console.log("option number is: " + optionNum);
				var plot_id = "", strip1, strip2, strip3;
				if(lighting1 != null && zoneTemp1 != null && chilledWaterTemp1 != null && lighting2 != "" && zoneTemp2 != null && chilledWaterTemp2 != null && lighting3 != null && zoneTemp3 != null && chilledWaterTemp3 != null)
				{
					var outputString = "", outputString1 = "", outputString2 = "", outputString3 = "";
					var child1 = exec('kwprediction.exe ' + lighting1 + ' ' + zoneTemp1 + ' ' + chilledWaterTemp1, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
					   {
							console.log(stderr);
					   }
					   else
					   {
						   if(stdout != null)
						   {
								strip1 = parseFloat(stdout.trim());
								outputString1 = "1" + "~" + strip1.toString() + "~"; 
								console.log("1st strategy output is: " + strip1);
								if(outputString1 != "" && outputString2 != "" && outputString3 != "")
								{
									makePlot(lighting1, zoneTemp1, chilledWaterTemp1, strip1, lighting2, zoneTemp2, chilledWaterTemp2, strip2, lighting3, zoneTemp3, chilledWaterTemp3, strip3, function callback(plot_id) {
										outputString = outputString1 + outputString2 + outputString3 + plot_id;
										console.log(outputString);
										response.write(outputString);
										response.end();
									});
								}
						   }
					   }
					});
					var child2 = exec('kwprediction.exe ' + lighting2 + ' ' + zoneTemp2 + ' ' + chilledWaterTemp2, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
					   {
							console.log(stderr);
					   }
					   else
					   {
						   if(stdout != null)
						   {
								strip2 = parseFloat(stdout.trim());
								outputString2 += "2" + "~" + strip2.toString() + "~"; 
								console.log("2nd strategy output is: " + strip2);
								if(outputString1 != "" && outputString2 != "" && outputString3 != "")
								{
									makePlot(lighting1, zoneTemp1, chilledWaterTemp1, strip1, lighting2, zoneTemp2, chilledWaterTemp2, strip2, lighting3, zoneTemp3, chilledWaterTemp3, strip3, function callback(plot_id) {
										outputString = outputString1 + outputString2 + outputString3 + plot_id;
										console.log(outputString);
										response.write(outputString);
										response.end();
									});
								}
						   }
					   }
					});
					var child3 = exec('kwprediction.exe ' + lighting3 + ' ' + zoneTemp3 + ' ' + chilledWaterTemp3, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
					   {
							console.log(stderr);
					   }
					   else
					   {
						   if(stdout != null)
						   {
								strip3 = parseFloat(stdout.trim());
								outputString3 += "3" + "~" + strip3.toString() + "~"; 
								console.log("3rd strategy output is: " + strip3);
								if(outputString1 != "" && outputString2 != "" && outputString3 != "")
								{
									makePlot(lighting1, zoneTemp1, chilledWaterTemp1, strip1, lighting2, zoneTemp2, chilledWaterTemp2, strip2, lighting3, zoneTemp3, chilledWaterTemp3, strip3, function callback(plot_id) {
										outputString = outputString1 + outputString2 + outputString3 + plot_id;
										console.log(outputString);
										response.write(outputString);
										response.end();
									});
									
								}
								
						   }
						}
					})
				}
				else
				{
					console.log("not the right option Num")
					response.write("not the right option Num");
					response.end();
				}
			}
			else if(optionNum == 2 || optionNum == 3)
			{
				console.log("option number is: " + optionNum);
				var outputString = "";
				if(lighting1 != "null" && zoneTemp2 != "null" && chilledWaterTemp3 != "null")
				{
					var child = exec('kwprediction.exe ' + lighting1 + ' ' + zoneTemp1 + ' ' + chilledWaterTemp1, function( error, stdout, stderr) 
					{
					   if ( error != null ) 
					   {
							console.log(stderr);
					   }
					   else
					   {
						   if(stdout != null)
						   {
								var strip1 = parseFloat(stdout.trim());
								outputString = strip1.toString() + "~"; 
								console.log("The strategy output is: " + strip1);
								makePlot2(lighting1, zoneTemp1, chilledWaterTemp1, strip1, function callback(plot_id) {
										outputString += plot_id;
										console.log(outputString);
										response.write(outputString);
										response.end();
									});
						   }
					   }
					});
				}
				else
				{
					console.log("not the right option Num")
					response.write("not the right option Num");
					response.end();
				}

			}
			else
			{
				console.log("not the right option Num");
				response.write("not the right option Num");
				response.end();
			}
		}
	}
	else
	{
		console.log("identifier undefined")
		response.write("identifier undefined");
		response.end();
	}
});
app.listen(3000, "0.0.0.0");