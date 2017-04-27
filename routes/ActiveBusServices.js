const Router = require('express').Router,
	LTADataMall = require('lta-datamall')
	fs = require('fs'),
	path = require('path');

const BusServiceAPI = LTADataMall.BusServiceAPI,
	busServiceAPI = new BusServiceAPI(JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'))).accountKey);

const api = Router();

var	cache = {};

function updateCache() {
	busServiceAPI.getBusServicesOperatingNow(services => {
		var list = {
			currentlyActiveServices: services.map(service => {
				return {
					serviceNo: service.serviceNo,
					direction: service.direction
				};
			}),
			lastRefreshTime: new Date()
		};
		cache = list;
	});
}

setInterval(updateCache, 600000);
updateCache();

api.get('/', (req, res) => {
	if (!cache) {
		res.status(500).json({
			error: 'Server is currently building bus service list.'
		});
	} else 
		res.json(cache);
});

module.exports = {
	router: api,
	mountPath: '/bus/services/active'
}
