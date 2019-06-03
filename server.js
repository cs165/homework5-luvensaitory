const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1hrS5PEDhghrpw94Uh6hRxAgXdUftnLNfHqd48fB3EX0';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
    const result = await sheet.getRows();
    const rows = result.rows;
    const ans = [];
    for (let i = 1; i < rows.length; i++) {
        temp = {}
        temp[rows[0][0]] = rows[i][0];
        temp[rows[0][1]] = rows[i][1];
        ans.push(temp);
    }
    res.json(ans);
}
app.get('/api', onGet);

async function onPost(req, res) {
    const messageBody = req.body;
    const result = await sheet.getRows();
    const rows = result.rows;
    let idx = rows.length;
    const ans = [];
    for (let i = 0; i < rows[0].length; i++) {
        ans.push(messageBody[rows[0][i]]);
    }
    const status = await sheet.setRow(idx, ans);
    res.json(status);
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
    const column = req.params.column;
    const value = req.params.value;
    const messageBody = req.body;

    // TODO(you): Implement onPatch.

    res.json({ status: 'unimplemented' });
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
    const column = req.params.column; //name
    const value = req.params.value; //Bort
    const result = await sheet.getRows();
    const rows = result.rows;
    let idx = -1;
    for (let i = 0; i < rows[0].length; i++) {
        if (rows[0][i] === column) {
            idx = i;
            break;
        }
    }
    let ans;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][idx] === value) {
            ans = await sheet.deleteRow(i);
            break;
        }
    }
    res.json(ans);
}
app.delete('/api/:column/:value', onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`Server listening on port ${port}!`);
});