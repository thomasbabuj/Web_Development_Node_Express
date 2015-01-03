/* 
	This is code is for the chapter 10, middlewares
*/

var express = require('express');

var app = express();

// First middle ware 
app.use(function(req, res, next){
	console.log('\n\n ALLWAYS');
	next();
});

// Route 'A'
app.get('/a', function(req, res){
	console.log('/a : route terminated');
	res.send('a');
});

// Route 'A' this will be never called
app.get('/a', function(req, res) {
	console.log('/a : never called');
});

// Route 'B'
app.get('/b', function(req, res, next) {
	console.log('/b : route not terminated');
	next();
});

// another middleware. Since there is a next() method called in the previous route, this
// will be executed.
app.use(function(req, res, next){
	console.log('\n\n SOMETIMES');
	next();
});

// Route 'B' - Since there is a next() method called in the previous route, this
// will be executed.
app.get('/b', function(req, res, next){
	console.log('/b (part 2): error thrown');
	throw new Error('b failed');		
});

// another middleware 'B' - this middleware will be executed
// this middleware have an additional param "err"
// here next(err) method will invoke the 500 error middleware
app.use('/b', function(err, req, res, next){
	console.log('/b error detected and passed on');
	next(err);
});

//Route 'C' - this route will only have err and req param
app.get('/c', function(err,req){
	console.log('/c : error thrown');
	throw new Error('c failed');
	//res.send('c');
});

// another middleware with route
// this middleware has a path
// here the next() doesn't have the err value, so the next() will 
// invoke 404 error middleware
app.use('/c', function(err, req, res, next) {
	console.log('/c: error detected but not passed on');
	next();
});

// 500 error middleware
app.use(function(err, req, res, next){
	console.log('unhandled error detected : '+ err.message);
	res.send('500 - server error');
});

// 404 error middleware
app.use(function(req, res) {
	console.log('route not handled');
	res.send('404 - not found');
});



app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), function(){
	console.log ('Express started on http://localhost:'+ app.get('port') + '; press Ctrl+C to terminate.');
});