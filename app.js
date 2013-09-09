var ACS = require('acs').ACS;
var logger = require('acs').logger;
var express = require('express');
var partials = require('express-partials');
var cloudinary = require('cloudinary');

// initialize app
function start(app, express) {
	ACS.init('Auth_name', 'Auth_password');
  	logger.setLevel('DEBUG');
  	
  	//use connect.session
	app.use(express.cookieParser());
	app.use(express.session({ key: 'node.acs', secret: "my secret" }));
	
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));		//set favicon

	//set to use express-partial for view
  	app.use(partials());

  	//Request body parsing middleware supporting JSON, urlencoded, and multipart
  	app.use(express.bodyParser());
}

// release resources
function stop() {
	
}
