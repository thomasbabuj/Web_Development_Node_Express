/* Encapsulating email functionality */

var nodemailer = require('nodemailer');

module.exports = function(credentails) {

	var mailTransport = nodemailer.createTransport('SMTP', {
		service : 'Gmail',
		auth : {
			user : credentails.gmail.user,
			pass : credentails.gmail.password,
		}
	});

	var from = 'Chopelah <info@chopelah.com>';
	var errorRecipient = 'chopelah@gmail.com';

	return {
		send : function(to, subj, body) {
			mailTransport.sendMail({
				from : from,
				to : to,
				subject : subj,
				html : body,
				generateTextFromHtml : true
			}, function(err){
				if( err )
					console.error('Unable to send email' + err );
			});
		},

		emailError : function(message, filename, exception) {
			var body = '<h1>Error Page</h1>' +
				'message : <br><pre>' + message + '</pre><br />';
			if( exception )
				body += 'exception:<br ><pre>' + exception + '</pre><br />';
			if (filename)
				body += 'filename:<br/><pre>' + filename + '</pre><br />';

			mailTransport.sendMail({
				from : from,
				to : errorReceipent,
				subject : 'My Test page error',
				html : body ,
				generateTextFromHtml : true
			}, function(err){
				if(err)
					console.error('Unable to send email: ' + err);
			});
		}
	}
};