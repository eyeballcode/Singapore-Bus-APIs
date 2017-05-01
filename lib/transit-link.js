const JSDOM = require('jsdom').JSDOM,
    request = require('request');

class TransitLink {
	
	constructor() {
	    this.serviceInfo = db.collection('service-info');
	}

	isNightService(service) {
	    return service.toString().startsWith('NR') || service.toString().endsWith('N');
	}

	getServiceGuideDOM(service, callback) {
	    request('http://www.transitlink.com.sg/eservice/eguide/service_route.php?service=' + service, (err, res) => {
		if (res.body.indexOf('The service number that you have entered is not valid') !== -1) {
		    callback(null);
		    return;
		}
		callback(new JSDOM(res.body, {runScripts: 'outside-only'}));
	    });
	}

	getBusServiceData(service, callback) {
		this.serviceInfo.find({
		    serviceNo: service
		}).next((err, serviceData) => {
		    if (!serviceData) {
			this.getServiceGuideDOM(service, dom => {
				
			});
		    } else {
			callback(serviceData);
		    }
		});
	}

	listAllBusServices(callback) {
		cache.get('bus-services-list', (err, services) => {
			if (!err) {
				if (!services) {
					request('http://www.transitlink.com.sg/eservice/eguide/service_idx.php', (err, res) => {
						var dom = new JSDOM(res.body, {runScripts: 'outside-only'});
						services = dom.window.eval(`Array.from(document.querySelectorAll('option')).filter(e=>e.value!='-').map(e=>e.value)`).sort();
						cache.set('bus-services-list', services);
						callback(services);
					});
				} else {
					callback(services);
				}
			}
		});
	}

}

module.exports = TransitLink;
