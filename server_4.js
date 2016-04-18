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
        return numeral(Number(val[0])).format('$0,0.00');
    },
    numberFormat = function(val) {
        return numeral(Number(val[0])).format('0,0');
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
            tickerArr = tickerStr.replace(/\s+/g,'').split(','),
            expandedIndex = tickerArr.indexOf('expanded');

        //process ticker string
        var expandedInfo = expandedIndex !== -1;

		if (expandedInfo)
			tickerArr.splice(expandedIndex, 1);

		var ticker = tickerArr.join(','),
		    quoteWsUrl = 'http://ws.cdyne.com/delayedstockquote/delayedstockquote.asmx/GetQuoteDataSet?StockSymbols=' + ticker + '&LicenseKey=0';

        //console.log('==> tickerStr: ' + tickerStr + '--- tickerArr: ' + tickerArr + '--- ticker: ' + ticker);

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

					    //console.log('result: ==== ' + JSON.stringify(result));

					    var tickerResultArr = result.DataSet['diffgr:diffgram'][0].QuoteData[0].Quotes,
					        textBody = [];

                        //console.log('tickerResultArr: ==== ' + JSON.stringify(tickerResultArr));

					    for (var idx = 0; idx < tickerResultArr.length; idx++) {
					    	var tickerResultObj = tickerResultArr[idx];

						    textBody.push('Stock quote for ' + tickerResultObj.CompanyName + ' (' + tickerResultObj.StockSymbol + '): ' + currencyFormat(tickerResultObj.LastTradeAmount));

						    if (expandedInfo) {
						    	textBody.push('\n\n');
						    	textBody.push('Open: ' + currencyFormat(tickerResultObj.OpenAmount));
						    	textBody.push('\n');
						    	textBody.push('Days\'s Range: ' + currencyFormat(tickerResultObj.DayLow) + ' - ' + currencyFormat(tickerResultObj.DayHigh));
						    	textBody.push('\n');
						    	textBody.push('Previous Close: ' + currencyFormat(tickerResultObj.PrevCls));
						    	textBody.push('\n');
						    	textBody.push('Volume: ' + numberFormat(tickerResultObj.StockVolume));
						    	
						    }

						    textBody.push('\n');
						    textBody.push('------------------------\n');
					    }

					    //console.log('=>' + textBody.join(''));

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
