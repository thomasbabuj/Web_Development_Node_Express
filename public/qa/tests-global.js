/* 
* Global Tests - will run on every page
*/

suite('Global Tests', function(){
	test('page has a valid title', function(){
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	});
});