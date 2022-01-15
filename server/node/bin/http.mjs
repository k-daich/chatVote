module.exports = {
	HTTP
	path: null,
	fs: null,
	express: null,
	app: null,
	https: null,
	connection: null,
	startup: () => {
		path = require("path");
		HTTP.fs = require('fs');
		HTTP.express = require('express');
		HTTP.app = express();

		// Template Engineの定義
		app.set("view engine", "ejs");
		// HTMLファイルのフォルダを指定
		app.set("views", "ejs");

		// css等の静的ファイルのファルダを指定
		app.use(express.static(path.join(__dirname, "public")));

		HTTP.https = require('https');
		var options = {
			key: fs.readFileSync('./privkey.pem'),
			cert: fs.readFileSync('./fullchain.pem'),
		};
		var server = https.createServer(options, app);
		app.use(express.urlencoded({ extended: false }));

		const mysql = require('mysql2');
		HTTP.connection = mysql.createConnection({
			host: 'localhost',
			user: 'daich',
			password: 'xxxxxx',
			database: 'daichDB'
		});

		connection.connect((err) => {
			if (err) {
				console.log('error connecting: ' + err.stack);
				return;
			}
			console.log('success @ connection.connect');
		});

		app.use((err, req, res, next) => {
			console.error(err);
			res.status(err.statusCode || 500).json({ error: err.message });
		});

		server.listen(443);
	},
}
