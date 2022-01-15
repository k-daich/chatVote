'use strict'

/**
 * author : k-kondo
 */
console.log('start@app.js');

const path = require("path");
const fs = require('fs');
const express = require('express');
const app = express();
const router = express.Router();

// Template Engineの定義
app.set("view engine", "ejs");
// HTMLファイルのフォルダを指定
app.set("views", "ejs");

// css等の静的ファイルのファルダを指定
app.use(express.static(path.join(__dirname, "public")));

var https = require('https');
var options = {
	key: fs.readFileSync('./privkey.pem'),
	cert: fs.readFileSync('./fullchain.pem'),
};
var server = https.createServer(options, app);
app.use(express.urlencoded({ extended: false }));

const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'daich',
	password: 'xxxxX',
	database: 'daichDB'
});

connection.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	console.log('success @ connection.connect');
});

app.use(
	router.get(`/chatVote/view`, (req, res) => {
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

		const render = (result) => {
			let err;
			if (result.length === 0) err = 'QUESTION 0件。';
			// views/index.ejsをレンダリングし、データを渡す
			if (err) {
				res.render("index", { err: err });
			} else {
				res.render("index", { streamer: result[0]['STREAMER'] });
			}
		};
		const stremaer = req.query.streamer;
		// QUESTION_SEQのシーケンス取得
		const selMaxIdQuery = 'select * from QUESTION where ID = ('
			+ 'select MAX(ID) from QUESTION where STREAMER = \'' + stremaer
			+ '\');';
		exeQuery(selMaxIdQuery, render);
	})
);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.statusCode || 500).json({ error: err.message });
});

server.listen(443);
