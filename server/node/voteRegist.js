/**
 * author : k-kondo
 */
console.log('start@voteRegist.js');
var express = require('express');
var app = express();
var fs = require('fs');
var https = require('https');
var options = {
	key: fs.readFileSync('./privkey.pem'),
	cert: fs.readFileSync('./fullchain.pem'),
};
var server = https.createServer(options, app);

const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'daich',
	password: 'xxxx',
	database: 'daichDB'
});
connection.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	console.log('success');
});


const allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://kakuge-checker.com')
	res.header('Access-Control-Allow-Methods', 'GET,POST')
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, access_token'
	)
	// intercept OPTIONS method
	if ('OPTIONS' === req.method) {
		res.send(200)
	} else {
		next()
	}
}
app.use(allowCrossDomain)

// urlencodedとjsonは別々に初期化する
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', (req, res, next) => {
	console.log('run app.post()');
	console.log(req.body);

	const nullCheck = (name, value) => {
		if (value != null) return;
		throw `request data is null. item = ${name}.`;
	};

	const lengthCheck = (name, value, max) => {
		if (value.length <= max) return;
		throw `request data is over length. item = ${name}, value = ${value}.`;
	};

	nullCheck('theme', req.body.theme);
	nullCheck('choice1', req.body.choice1);
	nullCheck('choice2', req.body.choice2);
	nullCheck('streamer', req.body.streamer);
	lengthCheck('theme', req.body.theme, 128);
	lengthCheck('choice1', req.body.choice1, 32);
	lengthCheck('choice2', req.body.choice2, 32);
	lengthCheck('streamer', req.body.streamer, 32);
	if (req.body.choice3 != null) {
		lengthCheck('choice3', req.body.choice3, 32);
	}
	else {
		req.body.choice3 = '';
	}
	if (req.body.choice4 != null) {
		lengthCheck('choice4', req.body.choice4, 32);
	}
	else {
		req.body.choice4 = '';
	}


	const exeQuery = (queryStr, callback) => {
		console.log(`--- run SQL. query : ${queryStr}`);
		connection.query(
			queryStr,
			(error, result, fields) => {
				console.log(Object.prototype.toString.call(result));
				console.log(result);
				if (error) {
					return connection.rollback(() => {
						throw error;
					});
				}
				connection.commit((err) => {
					if (err) {
						return connection.rollback(() => {
							throw err;
						});
					}
					console.log('commit success!');
				});
				return callback(result);
			}
		);
	};
	const resOK = () => {
		res.status(200).json({ test: "daich" });
	};

	const insQuestion = (result) => {
		console.log(Object.prototype.toString.call(result));
		qSeq = result[0]['LII'];
		// QUESTION_SEQのシーケンス取得
		const insQuery = 'INSERT INTO QUESTION VALUES (\''
			+ qSeq + '\', \''
			+ req.body.theme + '\', \''
			+ req.body.choice1 + '\', \''
			+ req.body.choice2 + '\', \''
			+ req.body.choice3 + '\', \''
			+ req.body.choice4 + '\', \''
			+ req.body.streamer + '\''
			+ ');';
		exeQuery(insQuery, resOK);
	};

	const getSeq = () => {
		// QUESTION_SEQのシーケンス取得
		const getSeqQuery = 'SELECT LAST_INSERT_ID() as LII;';
		let qSeq = null;
		const seqResults = exeQuery(getSeqQuery, insQuestion);
	};

	// QUESTION_SEQのインクリメント
	const seqUpdQuery = 'UPDATE QUESTION_SEQ SET seq = LAST_INSERT_ID(seq + 1);';
	exeQuery(seqUpdQuery, getSeq);

});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.statusCode || 500).json({ error: err.message });
});

server.listen(443);
