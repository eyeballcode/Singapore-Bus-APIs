const LTADataMall = require('lta-datamall'),
	fs = require('fs'),
	path = require('path'),
	Model = require('./Model');

const BusServiceAPI = LTADataMall.BusServiceAPI,
	configs = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));

class ActiveBusServicesModel {

	constructor(requester) {
		this.busServiceAPI = new BusServiceAPI(configs.accountKey, {
			requester: requester
		});
		this.cache = {};

		setInterval(this.cacheUpdater, 600000);
		this.cacheUpdater();
	}

	cacheUpdater() {
		this.busServiceAPI.getBusServicesOperatingNow(services => {
			var list = {
				currentlyActiveServices: services.map(service => {
					return {
						serviceNo: service.serviceNo,
						direction: service.direction
					};
				}),
				lastRefreshTime: new Date()
			};
			this.cache = list;
		});
	}

	getActiveBusServices(callback) {
		callback(this.cache);
	}

}

module.exports = ActiveBusServicesModel;
