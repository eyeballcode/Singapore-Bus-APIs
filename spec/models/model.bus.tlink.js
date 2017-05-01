const TransitLinkModel = require('../../models/TransitLinkModel'),
	MongoClient = require('mongo-mock').MongoClient,
	mockTLink = require('../mock/mock-tlink');

function dbMock(cb) {
    new MongoClient().connect('mongodb://localhost:27017/z', {}, (err, db) => {
	cb(db);
    });
}

describe('The TLink Model', () => {
    it('should return some basic info for a service', done => {
	dbMock(db => {
	    var model = new TransitLinkModel(db, mockTLink(1));
	    model.getServiceInfo('925', info => {
		expect(info.operator).toEqual('SMRT Buses');
		expect(info.terminals.length).toEqual(2);
		done();
	    });
	});
    });
    it('should properly handle NRs and Ns', done => {
	dbMock(db => {
	    var model = new TransitLinkModel(db, mockTLink(3));
	    model.getServiceInfo('NR5', info => {
		expect(info.operator).toEqual('SMRT Buses');
		done();
	    });
	});
    });
    it('should allow getting of stops', done => {
	dbMock(db => {
	    var model = new TransitLinkModel(db, mockTLink(1));
	    model.getServiceStops('925', stops => {
		expect(stops.directions[1]).toBeDefined();
		done();
	    });
	});
    });
    it('should return an error if the service is invalid', done => {
	dbMock(db => {
	    var model = new TransitLinkModel(db, mockTLink(4));
	    model.getServiceStops(':D:D:D:D', stops => {
		expect(stops.error).toBeDefined();
		done();
	    });
	});
    });
    it('should allow looking up all services', done => {
	dbMock(db => {
	    var model = new TransitLinkModel(db, mockTLink(2));
	    model.getAllServices(services => {
		expect(services.services).toBeDefined();
		expect(services.services.indexOf('925')).not.toBe(-1);
		done();
	    });
	});
    });
});
