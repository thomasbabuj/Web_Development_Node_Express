/*
* Creating a custom module
*  If something to be visible outside of the module, you have to add it to exports
*/

var fortunes = [
	"Conquer your fears or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know.",
	"You will have a pleasent surprise.",
	"Whenever possible, keep it simple."
];

exports.getFortune = function(){
	var idx = Math.floor(Math.random() * fortuneCookies.length);
	return fortuneCookies[idx];
}