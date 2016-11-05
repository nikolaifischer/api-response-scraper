var http = require('http');
var mongoose = require('mongoose');
var config = require('../config');

var parking = require('./models/parking');

// Models

var parking = require('./models/parking');

var options = {
	user: config.user,
	pass: config.password
}




mongoose.connect(config.db, options);



mongoose.connection.on('connected', function () {  



	stealDatData = function() {

		console.log("Stealing Data. Don't tell anyone.");


		http.get({
		  hostname: 'opendata.dbbahnpark.info',
		  port: 80,
		  path: '/api/beta/occupancy',
		  agent: false  // create a new agent just for this one request
		}, function(res) {

			var body = "";
			res.on("data", function(chunk) {
		    body += chunk;
		  	});

		    res.on("end", function() {

		    	var data= JSON.parse(body);
		    	console.log(data.allocations.length);

		    	for(var i=0; i<data.allocations.length; i++) {
			    	nextEntry = new parking();
			    	nextEntry.entry = data.allocations[i];
			    	nextEntry.save();
			    	

		    	}

		    	console.log("added entries to the db");

		    });
		}
		);


		
	}

	setInterval(stealDatData, 60000*60); //every 60 mins

});

