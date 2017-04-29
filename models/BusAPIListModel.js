const Router = require('express').Router,
	Model = require('./Model');

class BusAPIListModel extends Model {

	constructor() {
		super();
	}

	getAPIList(callback) {
		callback({
			avaliablePaths: {
				timings: 'Provides info on bus timings for a given bus stop.',
				'active-services': 'Provides info on currently running bus services.',
				'service-info': 'Provides basic info about a bus service.',
				'service-stops': 'Provides the list of bus stops for a service',
				'service-list': 'Lists all bus services in Singapore'
			},
			paths: {
				timings: '/bus/timings/:busStop',
				'active-services': '/bus/services/active',
				'service-info': '/bus/services/info/:service',
				'service-stops': '/bus/services/info/:service/stops',
				'service-list': '/bus/services/list'
			}
		});
	}
}

module.exports = BusAPIListModel;
