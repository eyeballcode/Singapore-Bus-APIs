const TransitLink = require('../lib/transit-link.js'),
	Model = require('./Model');

const transitLinkAPI = new TransitLink(db);

var noSuchService = {
	error: 'The service provided was invalid'
};

class TransitLinkModel extends Model {

	constructor() {
		super();
	}

	getServiceInfo(busService, callback) {
		transitLinkAPI.getBusServiceData(busService, (busService => {
			if (!busService) callback(noSuchService);
		 	else {
			    delete busService.stops;
			    delete busService._id;
			    delete busService.type;
			    delete busService.service;
			    callback(busService);
			}
		}));
	}

	getServiceStops(busService, callback) {
		transitLinkAPI.getBusServiceData(busService, (busService => {
			if (!busService) callback(noSuchService);
			 else {
				callback({
				    directions: busService.stops
				});
			}
		}));
	}

	getAllServices(callback) {
	    transitLinkAPI.listAllBusServices(services => {
		callback(services);
	    });
	}

}

module.exports = TransitLinkModel;
