const TransitLink = require('../lib/transit-link.js'),
	Model = require('./Model');

const transitLinkAPI = new TransitLink();

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
				callback(busService);
			}
		}));
	}

	getServiceStops(busService, callback) {
		transitLinkAPI.getBusServiceData(busService, (busService => {
			if (!busService) callback(noSuchService);
			 else {
				delete busService.operationDays;
				delete busService.operationTimings;
				delete busService.terminals;
				delete busService.frequency;
				delete busService.operator;
				callback(busService);
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
