const express = require('express'),
        bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path');

const app = express(),
	  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'))),
      port = config.port || 8000;
      console.log(port)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
	res.jsonError = (error) => {
		res.status(400).json(error);
	};
	next();
});

fs.readdir(path.join(__dirname, 'routes'), (err, files) => {
	files.filter(name => name.endsWith('.js')).forEach(name => {
		const router = require(path.join(__dirname, 'routes', name));
		console.log(`Using router ${name.replace(/\.js$/, '')}.`);
		app.use(router.mountPath, router.router);
	});
});

app.listen(port);