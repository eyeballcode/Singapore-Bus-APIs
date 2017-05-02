const BusAPIController = require('../../controllers/BusAPIController'),
	MongoClient = require('mongo-mock').MongoClient
	tlinkMock = require('../mock/mock-tlink'),
	timingsMock = require('../mock/bus-timing-mock'),
	serviceMock = require('../mock/bus-service-mock')
	express = require('express'),
	request = require('supertest');

function controllerMock(cb, type) {
    new MongoClient().connect('mongodb://localhost:27017/z', {}, (err, db) => {
	var controller = new BusAPIController(db, tlinkMock(type || 1), serviceMock, timingsMock(49121));
	var app = express();
	app.use('/bus', controller.router);
	/* istanbul ignore next */
	app.use((req,res)=>{res.status(404).end();})
        cb(app);
    });
}

function f(done) {
    return (err,res) => {
	/* istanbul ignore if: IT'S GOOD THAT THE TEST PASSED OK?? */
	if (err) done.fail(err); else done();
    }
}

describe('The Bus API controller', () => {
    it('Should allow querying of bus stop timings', done => {
	controllerMock(app => {
	    request(app)
		.get('/bus/timings/49121')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(f(done));
	});
    });
    it('should allow querying of active services', done => {
	controllerMock(app => {
	    request(app)
		.get('/bus/services/active')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(f(done));
	});
    });
    it('should allow querying of bus service info', done => {
	controllerMock(app => {
	    request(app)
		.get('/bus/services/925/info')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(f(done));
	});
    });
    it('should return 400 for invalid services', done => {
	controllerMock(app => {
	    request(app)
		.get('/bus/services/000/info')
		.expect('Content-Type', /json/)
		.expect(400)
		.end(f(done));
	}, 4);
    });
    it('should allow querying of all services', done => {
	controllerMock(app => {
	    request(app)
		.get('/bus/services/list')
		.expect('Content-Type', /json/)
		.expect(200)
		.end(f(done));
	}, 2);
    });
});
