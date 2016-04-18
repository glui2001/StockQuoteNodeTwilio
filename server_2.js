var http = require('http'),
	xml2js = require('xml2js'),
	url = require('url'),
	numeral = require('numeral'),
	accountSid = 'AC6cb41d2c4476f7ec6f73caa3f8f890a8',
    authToken = '05698ff30e915eb04dda72ca33a264a6',
    destinationNumber = '+15103328835',
	twilio = require('twilio')(accountSid, authToken),
	currencyFormat = function(val) {
		return numeral(Number(val[0])).format('$0,0.00');
    },
    numberFormat = function(val) {
        return numeral(Number(val[0])).format('0,0');
    };

var server = http.createServer(function(request, response) {
});

server.listen(3000);

server.on('request', function(req, res) {
	console.log('-------------------------');
	console.log('req.url: ' + req.url);
	console.log('url: ' + JSON.stringify(url.parse(req.url)));

	// var parsedUrl = url.parse(req.url, true);
	// console.log('parsedUrl:' + JSON.stringify(parsedUrl) );

	var parsedUrl = url.parse(req.url, true),
		ticker = new String(parsedUrl.query.ticker).toUpperCase(),
	 	quoteWsUrl = 'http://ws.cdyne.com/delayedstockquote/delayedstockquote.asmx/GetQuote?StockSymbol=' + ticker + '&LicenseKey=0';

	//fetch stock quote from web service
	http.get(quoteWsUrl, function(response) {
		var msg = '';

		if (response.statusCode === 200) {
			response.setEncoding('utf8');

			response.on('data', function(chunk) {
				msg += chunk;
			});

			response.on('end', function() {
				res.statusCode = 200;

			    xml2js.parseString('' + msg, function (err, result) {
				    res.statusCode = 200;

				    //console.log('result: ==== ' + JSON.stringify(result));

				    var textBody = ['Stock quote for ' + result.QuoteData.CompanyName + ' (' + ticker + '): ' + currencyFormat(result.QuoteData.LastTradeAmount)];

				    if (parsedUrl.query.expanded) {
				    	textBody.push('\n\n');
				    	textBody.push('Open: ' + currencyFormat(result.QuoteData.OpenAmount));
				    	textBody.push('\n');
				    	textBody.push('Days\'s Range: ' + currencyFormat(result.QuoteData.DayLow) + ' - ' + currencyFormat(result.QuoteData.DayHigh));
				    	textBody.push('\n');
				    	textBody.push('Previous Close: ' + currencyFormat(result.QuoteData.PrevCls));
				    	textBody.push('\n');
				    	textBody.push('Volume: ' + numberFormat(result.QuoteData.StockVolume));
				    }

					//send text
					//twilio.messages.create({
					//    to: destinationNumber,
					//    from: '+16506662343',  //my twilio number/account
					//    body: textBody.join('')
					//}, function(error, message) {
					//    if (error) {
					//        console.log(error.message);
					//    }
					//});

					//show on browser data being sent
					res.end(textBody.join(''));
				});
			});
		}
	}).on('error', function(err) {
		console.log('error: ' + err);
	});

});
