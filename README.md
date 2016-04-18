# StockQuoteNodeTwilio
Various examples of fetching stock quotes using nodeJS and Twilio mobile messaging API

# Setup
- Install nodeJS (https://nodejs.org/en/download/)
- Run 'npm install' locally
- Create Twilio account and Twilio number.  Please refer to the guides at https://www.twilio.com/docs/quickstart

# Description
<ol>
  <li>server.js: NodeJS app that calls a webserver to fetch a stock ticker parameter.  Outputs raw results to document.</li>
  <li>server_2.js: Same as server.js except with beautifying of display.  Shows more information in results on "expanded" Parameter. Sends SMS message  directly to your cell.
  <li>server_3.js: Same as server.js except that SMS message is sent using the TwimlResponse object.
  <li>inbound.js: Simple sample code to test the receiving (and handling) of a text message sent to your registered Twilio number.
  <li>server_4.js: Putting it all together (server_3.js and inbound.js).
</ol>

Ultimately run server_4.js for the definitive demo (after you've made the proper Twilio configurations).
