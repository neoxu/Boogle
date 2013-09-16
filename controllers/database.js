var util = require('util');
var url = require('url');
var cloudinary = require('cloudinary');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var dbUrl = format('');
var userCollection = 'user';
var clubCollection = 'club';
var courtCollection = 'court';

function dbUpdate(collectionName, query, doc, callback) {	
	
	function updateCallback(err) {
		if (!err) {
			console.log(collectionName + ' update success');
		} else {
			console.log(collectionName + ' update fail ' + err);
		}
	}

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {		
					if (callback)
						collection.update(query, doc, {upsert : true}, callback);
					else
						collection.update(query, doc, {upsert : true}, updateCallback);
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);
	});
}

function dbfind(collectionName, query, fields, sortParam, callback) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					var myCursor = collection.find(query, fields).sort(sortParam); 
					
					myCursor.toArray(function(err, docs) {
						if (!err) 				
							callback(docs);
						else
						    console.log(collectionName + ' find error ' + err);
					});    
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}

function dbfindOne(collectionName, query, fields, callBack) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					collection.findOne(query, fields, callBack); 
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}
	
function doRemove(collectionName, query, res) {	
	
	function removeCallback(err) {
		if (!err) {
			res.send({});
			console.log(collectionName + ' remove success ');
		} else {
			console.log(collectionName + ' remove fail ' + err);
		}
	}	

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {			
					collection.remove(query, true, removeCallback);						
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);	
	});
}

function fblogin(req, res) {	
	var urlData = url.parse(req.url,true);
	//console.log('fblogin: ' + util.inspect(urlData, true));	
	var user = {uid: urlData.query.uid, name: urlData.query.name};
	req.session.user = user;
	res.redirect('/');		
		
	var query = {
		uid : urlData.query.uid
	};
	var newUser = {
		$set : {
			uid : urlData.query.uid,
			name : urlData.query.name
		}
	};

	dbUpdate(userCollection, query, newUser); 
}

function fblogout(req, res) {	
	req.session.user = undefined;
	res.redirect('/');
}
	
function basketballclub(req, res) {	  
	var query = {};
	var fields = {_id: 0};
	var sortParam = {clubName:1};
	dbfind(clubCollection, query, fields, sortParam, function(docs){
		res.render('index', {
			title : 'Basketball Club',
			layout : 'layout',
			docs : docs,
			req : req
		});	
	});	
}

function createclub(req, res) {	  
	if (req.body.clubName) {		
		var query = {clubName : req.body.clubName};
		var club = {clubName: req.body.clubName, clubInfo: req.body.clubInfo};	
		
		if (req.files.file) {
			cloudinary.uploader.upload(req.files.file.path, function(result) {
				club['backgroundimg'] = result; 
				dbUpdate(clubCollection, query, club, updateCallback);
			});
		}
		else {
			dbUpdate(clubCollection, query, club, updateCallback);	
		}
		
		function updateCallback(err) {
			res.redirect('/');
		}
	} else {
		res.render('createclub', {
			title : 'Basketball Club',
			layout : 'layout',
			err : 'Infomation error.',
			req : req
		}); 
	}
}

function club(req, res) {	
	var urlData = url.parse(req.url,true);
	if (urlData && urlData.query && urlData.query.clubname) {		
		var query = {clubName : urlData.query.clubname};
		var fields = {_id : 0};
		dbfindOne(clubCollection, query, fields, function(err, club) {
			if (club) {
				res.render('club', {
					title : 'Club Information',
					layout : 'layout',
					club : club,
					req : req
				});
			} else
				res.send(404);
		});		
	} else {
		res.redirect('/');
	} 	
}
