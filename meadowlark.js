
/*
*  Our Project's entry point
*  app.<http_verb>( get,post... ) provides routes to our app
*  app.use - is the method by which express adds middleware. ( Catch-all handler for anything that didn't get matched by a route)
*  middlewares provides modularization, making it easier to hanlde requests.
*/

var express= require('express');
var exphbs = require('express-handlebars');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var credentials = require('./credentials.js');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var app = express();

//Create ExpressHandleBars instance with a default layout.
//Using handlebar helpers we are adding sections to our view
var hbs = exphbs.create({
	defaultLayout : 'main',
	helpers : {
		section : function(name, options) {
			if( !this._sections )
				this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//adding logging support
switch(app.get('env')) {
	case 'development' :
		// compact, colorful dev logging
		app.use(require('morgan')('dev'));
		break;
	case 'production' :
		// module 'express-logger supports daily log rotation'
		app.use(require('express-logger')({
			path : __dirname + '/log/requests.log'
		}));
		break;
}	


//Use middleware to detect test=1 in the querystring
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

//Adding cookieparser middleware
//linking the cookie parser middleware
app.use(require('cookie-parser')(credentials.cookieSecret));
//linking the express-session middleware
app.use(require('express-session')());

//Adding a middleware to load static files and views
app.use(express.static(__dirname + '/public'));

//Mocked weather data
function getWeatherData()
{
	return {
		locations : [
			{
				'name' : 'Chennai, India',
				'forecastUrl' : 'http://www.wunderground.com/global/stations/43279.html',
				'iconUrl' : 'http://icons.wxug.com/i/c/v1/hazy.svg',
				'weather' : 'Haze',
				'temp' : '28 C'
			},
			{
				'name' : 'Ormoc, Philippines',
				'forecastUrl' : 'http://www.wunderground.com/q/zmw:00000.7.98550?MR=1',
				'iconUrl' : 'http://icons.wxug.com/i/c/v1/tstorms.svg',
				'weather' : 'Thunderstrom',
				'temp' : '33.2 C'
			},
			{
				'name' : 'Singapore',
				'forecastUrl' : 'http://www.wunderground.com/global/stations/48698.html?MR=1',
				'iconUrl' : 'http://icons.wxug.com/i/c/v1/mostlycloudy.svg',
				'weather' : 'Mostly Cloudy',
				'temp' : '27 C'
			},
		],
	};
}

//middleware to add weather data to the context
app.use(function(req, res, next){
	if(!res.locals.partials)
		res.locals.partials = {};

	res.locals.partials.weather = getWeatherData();
	next();
});

//Adding a middleware to add the flash object to the context if there is one in the session
app.use(function(req, res, next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

//Adding some routes for the Home and About Page
app.get('/', function(req, res) {
	// Added cookie and signed cookie on the home page
	res.cookie('monster', 'nom nom');
	res.cookie('signed_monster', 'nom nom', {signed : true});
	res.render('home');	
});

//display virtual fortune cookies on the page
app.get('/about', function(req, res){	
	res.render('about', { 
		fortune : fortune.getFortune() ,
		pageTestScript : '/qa/tests-about.js'
	});		
});

//Add a route for test jquery page
app.get('/test-jquery', function(req, res){
	res.render('jquery-test');
});

//Routes for nursery rhyme page and ajax call
app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res) {
	res.json({
		animal : 'squirrel',
		bodyPart : 'tail',
		adjective : 'bushy',
		noun : 'heck'
	});
});

//Adding routes for two new pages(hood-river and request-group-rate)
app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});

app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});

// including body-parser middleware
// since bodyparser was deprecated
//app.use(require('body-parser')());
app.use(bodyParser.urlencoded({ extended : false }));

// Route for newsletter
//rendering the newsletter view and assigin value to csrf hidden variable
app.get('/newsletter', function(req, res){
	res.render('newsletter', { csrf : 'CSRF token goes here'}); 
});

// Newsletter form submision route
app.post('/process', function(req, res) {
	console.log('Form (from querystring):' + req.query.form);
	console.log('CSRF token (from hidden form field) :' + req.body._csrf);
	console.log('Name (from visible form field) :' + req.body.name);
	console.log('Email (from visible form field) :' + req.body.email);
	// We could render a view like this
	//res.render('newsletter');

	//handling the ajax request
	if(req.xhr || req.accepts('json, html') === 'json'){
		// if there were an error, we would send { error : 'error description' }
		res.send({ success: true });
	} else {
		// if there were an error , we would redirect to an error page
		res.redirect(303, '/thank-you');	
	}	
});

// Route for the photo upload form
app.get('/contest/vacation-photo', function(req, res){
	var now = new Date();
	res.render('vaction-photo', {
		year : now.getFullYear(),
		month : now.getMonth()+1
	});
});

// Route for the photo upload
app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if( err ) 
			return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		console.log(303, '/thank-you');
	});
});

app.get('/jqfu', function(req, res){
	res.render('jqfu');
});

// using jquery middleware to upload files
app.use('/upload', function(req, res, next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir : function(){
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl : function() {
			return '/uploads/' + now;
		}
	})(req, res, next);
});

//newsletter signup 
app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	//input validation
	 var reg = "/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/";
	 
	if( !email.match(reg) ) {
		if( req.xhr )
			return res.json({ error : 'Invalid name email address.'});
		req.session.flash = {
			type : 'danger',
			intro : 'Validation error!',
			message : 'The email address you enerted was not valid.'
		};
		return res.redirect(303, '/newsletter/archive');
	}

	new NewsletterSignup({name : name, email : email}).save(function(err){
		if( err ) {
			if(req.xhr)
				return res.json({'error' : 'Database error.'});
			res.session.falsh = {
				type: 'danger',
				intro : 'Database error!',
				message : 'There was a databse error; Please try again later.'
			};
			return res.redirect(303, '/newsletter/archive')
		}

		if( req.xhr ) return res.json({ success : true });
		res.session.flash = {
			type : 'success',
			intro : 'Thank you!',
			message : 'You have now been signed up for the newsletter.'
		}
	});
});

app.get('/send_email', function(req, res) {

	// including my custom email module
	var emailService = require('./lib/email.js')(credentials);

	emailService.send('chopelah@gmail.com', 'My Nodejs Development App', '<b>Thanks for your support!..</b>');
});

app.get('/send_email', function(req, res){

	// This code is trying to use nodemailer 1.0.3
	// and got error
	console.log ( "Gmail user " + credentials.gmail.user );
	console.log ( "Gmail password " + credentials.gmail.password );
	
	var mailTransport = nodemailer.createTransport(

		smtpTransport({
    		service: 'Gmail',
    		auth: {
				user : credentials.gmail.user,
				pass : credentials.gmail.password
			}
	})); 

	//Setting up email data
	var mailOptions = {
		from : '"ChopeLah" <info@chopelah.com>',
		to : 'chopelah@gmail.com',
		subject : 'Hello from nodemailer',
		text : 'Hello World',
		html : '<b>Hello World</b>'
	};

	mailTransport.sendMail(mailOptions, function(error, info) {
		if (error)
			console.log( error );
		else
			console.log ('Message sent :' + info.response );
	});

	res.send('Sending Email....');
});


//Custom 404 page
//Catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

//Custom 500 page
// error-handler middleware
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');		
});

app.listen(app.get('port'), function(){
	console.log ('\n\n Express started on ' 
		+ app.get('env')  + ' environment '
		+ ' http://localhost:' + app.get('port') + '; press Ctrl+C to terminate.');	
});