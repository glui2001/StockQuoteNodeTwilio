var http = require('http'),
	xml2js = require('xml2js'),
	url = require('url');

var server = http.createServer(function(request, response) {
});

server.listen(3000);

server.on('request', function(req, res) {
	console.log('-------------------------');
	console.log('req.url: ' + req.url);
	console.log('url: ' + JSON.stringify(url.parse(req.url)));

	// var parsedUrl = url.parse(req.url, true);
	// console.log('parsedUrl:' + JSON.stringify(parsedUrl) );
	// console.log('querystring: ' + JSON.stringify(parsedUrl.query));

	var parsedUrl = url.parse(req.url, true),
		ticker = parsedUrl.query.ticker,
	 	myUrl = 'http://ws.cdyne.com/delayedstockquote/delayedstockquote.asmx/GetQuote?StockSymbol=' + ticker + '&LicenseKey=0';

	//fetch stock quote from web service 
	http.get(myUrl, function(response) {
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
				    // console.log('result: ==== ' + JSON.stringify(result));

				    res.end(JSON.stringify(result));
				});
			});
		}
	}).on('error', function(err) {
		console.log('error: ' + err);
	});
});
