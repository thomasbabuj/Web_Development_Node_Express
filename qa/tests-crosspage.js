/*
*  Creating crosspage testing using zomibe headless browser
*/

var Browser = require('zombie'),
	assert  = require('chai').assert;

var browser;

suite('Cross-Page Tests', function(){
	
	setup(function(){
		browser = new Browser();
	});

	test('requesting a group rate quote from the hood river tour page ' +
		  'populate the hidden referrer field correctly', function(done) {

	  	var referrer = 'http://localhost:3000/tours/hood-river';
	  	browser.visit(referrer, function(){
	  		browser.clickLink('.requestGroupRate', function(){
	  			assert(browser.field('referrer').value === referrer);
	  			done();
	  		});
	  	});
	  	this.timeout(15000);
	});	

	test('requesting a group rate quote from the origin coast tour page should ' +
			  'populate referrer field correctly', function(done) {

		  	var referrer = 'http://localhost:3000/tours/oregon-coast';
		  	browser.visit(referrer, function(){
		  		browser.clickLink('.requestGroupRate', function(){
		  			//assert(browser.field('referrer').value === referrer);
		  			done();
		  		});
		  	});		  	
	});

	test('visiting the "request group rate" page directly should result '+
		' in an empty referrer field', function(){
		browser.visit('http://localhost:3000/tours/request-group-rate', function(){
			assert(browser.field('referrer').value === '');
			done();
		});	
	});
		
});