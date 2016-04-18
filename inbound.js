var accountSid = 'AC6cb41d2c4476f7ec6f73caa3f8f890a8',
    authToken = '05698ff30e915eb04dda72ca33a264a6',
    twilio = require('twilio'), //(accountSid, authToken),
    http = require('http'),
    qs = require('querystring');
 
// Create an HTTP server, listening on port 1337, that will respond with a TwiML XML document
var server = http.createServer(function (req, res) {
    //Render the TwiML document using "toString"
});

server.listen(1337);

server.on('request', function(req, res) {
    var body = '';

    req.setEncoding('utf8');

    req.on('data', function(data) {
        body += data;
    });

    req.on('end', function() {
        var data = qs.parse(body);
        var resp = new twilio.TwimlResponse();
        var jsonString = JSON.stringify(data);
        var jsonDataObject = JSON.parse(jsonString);

        resp.message('Thanks, your message of ' + jsonDataObject.Body + ' was received!');

        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(resp.toString());
    });
});
 
console.log('Visit http://localhost:1337/ in your browser to see your TwiML document!');
