var express    = require("express");
var mysql      = require('mysql');
var exec = require('child_process').exec;
var plotly = require('plotly')('ssamarth','rjt9ukhxlf');
// var connection = mysql.createConnection({
//  host     : 'localhost',
//  user     : 'root',
//  password : '12345',
//  database : 'rtes'
//});
var app = express();

var url = require('url');


//connection.connect(function(err){
//if(!err) {
//    console.log("Database is connected ... \n\n");
//} else {
//    console.log("Error connecting database ... \n\n");
//}
//});
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
	//console.log(url_parts);
	if(identifier != null)
	{
		if(identifier == "advisor")
		{
			console.log("inside advisor");
			if(binNumber != 'undefined')
			{
				var child = exec('searchbin.exe ' + binNumber, function( error, stdout, stderr) 
			   {
				   if ( error != "" ) 
				   {
						console.log(stderr);
				   }
				   else
				   {
					  if(stdout != null)
					   {
							var strip = stdout.split("values: [");
							var output = strip[1].split(']');
							console.log(output[0]);
							response.write(output[0]);
							response.end();
					   }
					   else
					   {
							response.write("null output received");
							response.end();
					   } 
				   }
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
					   {c
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