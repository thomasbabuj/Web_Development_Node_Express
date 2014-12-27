/*
*  Test case to check that a link to contact page exists on the About page
*/

suite('"About" Page Tests', function(){
	test('page should contain link to contact page', function(){
		assert($('a[href="/contact"]').length);
	});
});