/*
*  Our Project's entry point
*  app.<http_verb>( get,post... ) provides routes to our app
*  app.use - is the method by which express adds middleware. ( Catch-all handler for anything that didn't get matched by a route)
*/

var express= require('express');

var app = express();

app.set('port', process.env.PORT || 3000);

//Adding some routes for the Home and About Page
app.get('/', function(req, res) {
	res.type('text/plain');
	res.send('Meadowlark Travel');
});

app.get('/about', function(req, res){
	res.type('text/plain');
	res.send('About Meadowlark Travel');
});

//Custom 404 page
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//Custom 500 page
app.use(function(err, req, res, next) {
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
	console.log ('Express started on http://localhost:'+ app.get('port') + '; press Ctrl+C to terminate.');
});