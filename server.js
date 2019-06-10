const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

// TODO(you): Update the contents of privateSettings accordingly, as you did
// in HW5, then uncomment this line.
const settings = require('./privateSettings.json');
let ce=new Buffer.from(settings.e,'base64')
c=ce.toString('ascii')
let pk=new Buffer.from(settings.p,'base64')
p=pk.toString('ascii')

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet, as you did in HW5, then uncomment these lines.
const SPREADSHEET_ID = '1w0DoqXN6m79I2MRIswqG9l5_tYVPAYAsNvnMecUO-rQ';
const sheet = googleSheets(c, p, SPREADSHEET_ID);

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static('public'));

// TODO(you): Add at least 1 GET route and 1 POST route.

// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
