const express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    {
        MongoClient,
        Server
    } = require('mongodb');

const app = express(),
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'))),
    port = config.port || 8000;

var mongoClient = new MongoClient();
mongoClient.connect('mongodb://localhost:27017/singapore-bus-apis', (err, database) => {
    if (err) throw err;

    global.db = database;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use((req, res, next) => {
        res.jsonError = (error) => {
            res.status(400).json(error);
        };
        next();
    });

    fs.readdir(path.join(__dirname, 'controllers'), (err, files) => {
        files.filter(name => name !== 'Controller.js' && name.endsWith('.js')).forEach(name => {
            const Controller = require(path.join(__dirname, 'controllers', name));
            console.log(`Using router ${name.replace(/\.js$/, '')}.`);
            app.use(Controller.mountPoint, new Controller().router);
        });
    });

    app.listen(port);
});