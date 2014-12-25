/*
*  Our Project's entry point
*  app.<http_verb>( get,post... ) provides routes to our app
*  app.use - is the method by which express adds middleware. ( Catch-all handler for anything that didn't get matched by a route)
*/

var express= require('express');
var exphbs = require('express-handlebars');

var app = express();

//Create ExpressHandleBars instance with a default layout.
var hbs = exphbs.create({
	defaultLayout : 'main'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//Adding some routes for the Home and About Page
app.get('/', function(req, res) {
	res.render('home');	
});

app.get('/about', function(req, res){
	res.render('about');	
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