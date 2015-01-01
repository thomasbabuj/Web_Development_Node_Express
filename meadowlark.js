
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

//Use middleware to detect test=1 in the querystring
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

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

//Adding some routes for the Home and About Page
app.get('/', function(req, res) {
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
	console.log ('Express started on http://localhost:'+ app.get('port') + '; press Ctrl+C to terminate.');
});