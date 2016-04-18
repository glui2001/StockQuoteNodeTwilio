var http = require('http'),
	xml2js = require('xml2js'),
	url = require('url'),
	numeral = require('numeral'),
	qs = require('querystring'),
	// accountSid = 'AC6cb41d2c4476f7ec6f73caa3f8f890a8',
    // authToken = '05698ff30e915eb04dda72ca33a264a6',
    // destinationNumber = '+15103328835',
	twilio = require('twilio'), //(accountSid, authToken),
	currencyFormat = function(val) {
		return numeral(val).format('$0,0.00');
	};

var server = http.createServer(function(req, res) {
});

server.listen(3000);

server.on('request', function(req, res) {
	var reqBody = '';

    req.setEncoding('utf8');

    req.on('data', function(data) {
        reqBody += data;
    });

    //process the twilio request
    req.on('end', function() {
        var reqData = qs.parse(reqBody),
            jsonString = JSON.stringify(reqData),
            jsonDataObject = JSON.parse(jsonString),
            tickerStr = jsonDataObject.Body,
            tickerArr = tickerStr.split(','),
            expandedIndex = tickerArr.indexOf('expanded');

        //process ticker string
        var expandedInfo = expandedIndex !== -1;

		if (expandedInfo)
			tickerArr.splice(expandedIndex, 1);

		var ticker = tickerArr[0],

		quoteWsUrl = 'http://ws.cdyne.com/delayedstockquote/delayedstockquote.asmx/GetQuote?StockSymbol=' + ticker + '&LicenseKey=0';

// console.log('==> tickerStr: ' + tickerStr + '--- tickerArr: ' + tickerArr + '--- ticker: ' + ticker);

        //fetch stock quote from web service 
		http.get(quoteWsUrl, function(response) {
			var msg = '';

			if (response.statusCode === 200) {
				response.setEncoding('utf8');

				response.on('data', function(chunk) {
					msg += chunk;
				});

				response.on('end', function() {
					
				    xml2js.parseString('' + msg, function (err, result) {
					    res.statusCode = 200;

					    // console.log('result: ==== ' + JSON.stringify(result));

					    var textBody = ['Stock quote for ' + result.QuoteData.CompanyName + ' (' + ticker + '): ' + currencyFormat(result.QuoteData.LastTradeAmount)];

					    if (expandedInfo) {
					    	textBody.push('\n\n');
					    	textBody.push('Open: ' + currencyFormat(result.QuoteData.OpenAmount));
					    	textBody.push('\n');
					    	textBody.push('Days\'s Range: ' + currencyFormat(result.QuoteData.DayLow) + ' - ' + currencyFormat(result.QuoteData.DayHigh));
					    	textBody.push('\n');
					    	textBody.push('Previous Close: ' + currencyFormat(result.QuoteData.PrevCls));
					    	textBody.push('\n');
					    	textBody.push('Volume: ' + numeral(result.QuoteData.StockVolume).format('0,0'));
					    }

					    console.log('==>' + textBody.join(''));

						//send text
						// twilio.messages.create({
						//     to: destinationNumber,
						//     from: '+16506662343',  //my twilio number/account
						//     body: textBody.join('')
						// }, function(error, message) {
						//     if (error) {
						//         console.log(error.message);
						//     }
						// });
						
						var tResp = new twilio.TwimlResponse();
    					tResp.message(textBody.join(''));

						//show on browser data being sent
						res.writeHead(200, {'Content-Type': 'text/xml'});
						res.end(tResp.toString());
					});
				});
			}
		}).on('error', function(err) {
			console.log('error: ' + err);
		});

    });
});
