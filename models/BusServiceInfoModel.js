const TransitLink = require('../lib/transit-link.js'),
	Model = require('./Model');

const transitLinkAPI = new TransitLink()

class BusServiceInfoModel extends Model {

	constructor() {
		super();
	}

	getServiceInfo(busService, callback) {
		transitLinkAPI.getBusServiceData(busService, (busService => {
			if (!busService) callback(null);
		 	else {
				delete busService.stops;
				callback(busService);
			}
		}));
	}

	getServiceStops(busService, callback) {
		transitLinkAPI.getBusServiceData(busService, (busService => {
			if (!busService) callback(null);
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

}

module.exports = BusServiceInfoModel;
