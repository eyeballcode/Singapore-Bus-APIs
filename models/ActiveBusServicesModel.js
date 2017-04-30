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
			var uniqueServices = {};
			for (let service of services) 
				if (!uniqueServices[service.serviceNo])
					uniqueServices[service.serviceNo] = {dirs: [service.direction], svc: service.serviceNo};
				else
					uniqueServices[service.serviceNo].dirs.push(service.direction);
			var list = {
				currentlyActiveServices: Object.keys(uniqueServices).map(service => {
					service = uniqueServices[service];
					return {
						serviceNo: `${service.svc}D{${service.dirs.reduce((a,b)=>a+','+b, '').substring(1)}}`,
					};
				}).filter(Boolean),
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
