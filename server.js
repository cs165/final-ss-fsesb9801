const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');
// TODO(you): Update the contents of privateSettings accordingly, as you did
// in HW5, then uncomment this line.
const googleapis = require('googleapis')
const googleAuth = require('google-auth-library')
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
async function onGet(req, res) {
	const id=req.params.id
	const properties=await new Promise((resolve) => {
		authenticate(c,p).then((oauth2Client) => {
			const sheets = googleapis.sheets('v4');
			sheets.spreadsheets.get({
				auth: oauth2Client,
				spreadsheetId: SPREADSHEET_ID
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					resolve( {error: err} );
					return;
				}
				resolve(response)
			});
		});
	});
	const sids=[]
	const titles=[]
	properties.sheets.forEach(sheet=>{
		let title=sheet.properties.title
		let sid=sheet.properties.sheetId
		titles.push(title)
		sids.push(sid)
	})
	let idx=titles.findIndex(item=>{return id===item})
	if(idx===-1)
		returnjson={'error':'notfound'}
	else
		returnjson={'sheetid':sids[idx]}
	res.json(returnjson)
}
app.get('/:id', onGet)

async function onPost(req, res) {
	const messageBody = req.body
	const id=req.params.id
	if(messageBody.mode.toLowerCase()!=='newdiary')
	{
		var response=await new Promise((resolve) => {
			authenticate(c, p).then((oauth2Client) => {
				const sheets = googleapis.sheets('v4');
				sheets.spreadsheets.values.get({
					auth: oauth2Client,
					spreadsheetId: SPREADSHEET_ID,
					range: id+"!A:Z",
				}, function(err, response) {
					if (err) {
						console.log('The API returned an error: ' + err);
						resolve( {'error': err} );
						return;
					}
					let rows = [];
					if (response && response.values) {
						rows = response.values;
					};
					resolve({rows: rows});
				});
			});
		});
		if(response.error!==undefined)
		{
			res.json({'error':'Communication error/Invalid ID'})
			return
		}
		var rows=response.rows
	}
	const mode=messageBody.mode
	console.log(id+':post mode:'+mode)
	if(messageBody.mode!==undefined)
	{
		const mode=messageBody.mode//getname,getdiary,newsheet,sortsheet...
		if(mode.toLowerCase()==='getname')
		{
			res.json({'name':rows[0][0]})
			console.log(id+':fetch data for user:'+rows[0][0])
			return
		}
		else if(mode.toLowerCase()==='newdiary')//createsheet
		{
			const name=messageBody.name
			if(name===undefined)
			{
				res.json({'error':'no name in request'})
				return
			}
			if(name.length===0)
			{
				res.json({'error':'invalid name'})
				return
			}
			row=[name]
			const response=await new Promise((resolve)=>{
				authenticate(c,p).then((oauth2Client)=>{
					const sheets=googleapis.sheets('v4');
					sheets.spreadsheets.batchUpdate({
					auth:oauth2Client,
					spreadsheetId:SPREADSHEET_ID,
					resource:
					{
						"requests":[
						{
							"addSheet":
							{
								"properties":
								{
									"title":id
								}
							}
						}
						]
					}
					},function(err,response){
						if(err)
						{
							console.log('The API returned an error:'+err);
							resolve({error:err});
							return;
						}
						resolve(response);
						const setname=new Promise((resolve) => {
							const rowNumber = 1;
							const range = `${rowNumber}:${rowNumber}`;
							authenticate(c, p).then((oauth2Client) => {
								const sheets = googleapis.sheets('v4');
								sheets.spreadsheets.values.update(
								{
									valueInputOption: 'RAW',
									auth: oauth2Client,
									spreadsheetId: SPREADSHEET_ID,
									range: id+'!'+range,
									resource:
									{
										range: id+'!'+range,
										values: [row],
										majorDimension: 'ROWS'
									}
								}, function(err, response) {
									if (err) 
									{
										console.log('The API returned an error: ' + err);
										resolve({error: err});
										return;
									}
									resolve({'response':'success'});
								});
							});
						});
					});
				});
			});
			//remember to return sheet id
			res.json({'sheetid':response.replies[0].addSheet.properties.sheetId})
			return
		}
		else if(mode.toLowerCase()==='getdiary')
		{
			let diary=[]
			for(let i=1,l=rows.length;i<l;i++)
			{
				let e=rows[i]
				diary.push(e)
			}
			res.json({'diary':diary})
			return
		}
		else if(mode.toLowerCase()==='sort')
		{
			const sIdx=parseInt(messageBody.sheetid)
			if(isNaN(sIdx))
			{
				res.json({'error':'no sheet id in request'})
				return
			}
			const response=new Promise((resolve)=>{
				authenticate(c,p).then((oauth2Client)=>{
					const sheets=googleapis.sheets('v4');
					sheets.spreadsheets.batchUpdate({
					auth:oauth2Client,
					spreadsheetId:SPREADSHEET_ID,
					resource:
					{
						"requests":[
							{
								"sortRange":
								{
									"range":
									{
										"sheetId":sIdx,
										"startRowIndex":1,
										"startColumnIndex": 0,
										"endColumnIndex": 2
									},
									"sortSpecs":[
									{
										"sortOrder":"ASCENDING",
										"dimensionIndex":0
									}
									]
								}
							}
						]
					}
					},function(err,response){
						if(err)
						{
							console.log('TheAPIreturnedanerror:'+err);
							resolve({error:err});
							return;
						}
						resolve({'response':'success'});
					});
				});
			});
			res.json(response)
			return
		}
	}
	res.json({})
}
app.post('/:id', jsonParser, onPost)

async function onPatch(req, res) {
	const id=req.params.id
	const index=req.params.index
	const messageBody=req.body
	const date=messageBody.date
	const content=messageBody.content
	if(date===undefined||content===undefined)
	{
		res.json({'error':'no update data'})
		return
	}
	row=['"'+date+'"',content]
	const response=await new Promise((resolve) => {
		if (index < 0)
		{
			resolve({'error':'row index < 0'});
			return;
		}
		const rowNumber = parseInt(index)+1;
		const range = `${rowNumber}:${rowNumber}`;
		authenticate(c, p).then((oauth2Client) => {
			const sheets = googleapis.sheets('v4');
			sheets.spreadsheets.values.update(
			{
				valueInputOption: 'RAW',
				auth: oauth2Client,
				spreadsheetId: SPREADSHEET_ID,
				range: id+'!'+range,
				resource:
				{
					range: id+'!'+range,
					values: [row],
					majorDimension: 'ROWS'
				}
			}, function(err, response) {
				if (err) 
				{
					console.log('The API returned an error: ' + err);
					resolve({error: err});
					return;
				}
				resolve({'response':'success'});
			});
		});
	});
	res.json(response)
}
app.patch('/:id/:index', jsonParser, onPatch)

async function onDelete(req, res) {//delete entire sheet
	const id=req.params.id;
	const sheetId=parseInt(req.params.sheetid)
	//check sheet id match id before delete
	const properties=await new Promise((resolve) => {
		authenticate(c,p).then((oauth2Client) => {
			const sheets = googleapis.sheets('v4');
			sheets.spreadsheets.get({
				auth: oauth2Client,
				spreadsheetId: SPREADSHEET_ID
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					resolve( {error: err} );
					return;
				}
				resolve(response)
			});
		});
	});
	const sids=[]
	const titles=[]
	properties.sheets.forEach(sheet=>{
		let title=sheet.properties.title
		let sid=sheet.properties.sheetId
		titles.push(title)
		sids.push(sid)
	})
	const sidx=sids.findIndex(item=>{return item===sheetId})
	if(sidx===-1||titles[sidx]!==id)
	{
		console.log('ID not match')
		res.json({'error':'ID not match,please refresh page.'})
		return
	}
	else
	{
		console.log('ID match,delete ID:'+id)
		const response=new Promise((resolve)=>{
				authenticate(c,p).then((oauth2Client)=>{
					const sheets=googleapis.sheets('v4');
					sheets.spreadsheets.batchUpdate({
					auth:oauth2Client,
					spreadsheetId:SPREADSHEET_ID,
					resource:
					{
						"requests": [
						{
							"deleteSheet":
							{
								"sheetId": sheetId
							}
						}
						]
					}
					},function(err,response){
						if(err)
						{
							console.log('TheAPIreturnedanerror:'+err);
							resolve({error:err});
							return;
						}
						resolve({'response':'success'});
					});
				});
			});
		res.json(response)
		return
	}
}
app.delete('/:id/:sheetid', onDelete);

function authenticate(email, key) {//copied from gsa-sheets.js
	const SCOPES = [
		'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/drive'
	];

	return new Promise((resolve, error) => {
		const auth = new googleAuth();
		const jwt = new googleapis.auth.JWT(
			email,
			null,
			key,
			SCOPES);
		jwt.authorize(function(err, result) {
			if (err) {
				console.log(err);
				error(err);
				return;
			} else {
				resolve(jwt);
			}
		});
	});
};

// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
	console.log(`Server listening on port ${port}!`);
});
