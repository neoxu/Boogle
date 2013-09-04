function index(req, res) {	  
	req.session.controller = "index";
	res.render('index', {
		title : 'Basketball Club',
		layout : 'layout',
		req : req
	});
}

function createclub(req, res) {	  
	req.session.controller = "index";
	res.render('createclub', {
		title : 'Create a basketball club',
		layout : 'layout',
		req : req
	});
}

function court(req, res) {	  
	req.session.controller = "index";
	res.render('court', {
		title : 'Popular Basketball Court',
		layout : 'layout',
		req : req
	});
}
