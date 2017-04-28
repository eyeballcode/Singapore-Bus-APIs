const NodeCache = require('node-cache'),
	JSDOM = require('jsdom').JSDOM,
	request = require('request');

const cache = new NodeCache({stdTTL: 86400});

class TransitLink {
	
	isNightService(service) {
		return service.toString().startsWith('NR') || service.toString().endsWith('N');
	}

	getBusServiceData(service, callback) {
		cache.get(service, (err, serviceData) => {
			if (!err) {
				if (!serviceData) {
					request('http://www.transitlink.com.sg/eservice/eguide/service_route.php?service=' + service, (err, res) => {
						if (res.body.indexOf('The service number that you have entered is not valid') !== -1) {callback(null);return;}
						var dom = new JSDOM(res.body, {runScripts: 'outside-only'});
						var data = {
							operationDays: [],
							operationTimings: {},
							operator: dom.window.eval(`document.getElementsByClassName('company')[0].textContent`),
							terminals: [],
							frequency: {},
							stops: []
						};
						function getTableData(row, column) {
							return dom.window.eval(`(document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(${row}) > td:nth-child(${column})') || {textContent:null}).textContent`);
						}
						if (!this.isNightService(service)) {
							data.terminals.push(getTableData(3, 1));
							if (getTableData(4, 1)) data.terminals.push(getTableData(4, 1));
						} else {
							data.terminals.push(dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)').textContent`));
						}
						function handleOperationSpecs(column, day) {
							if (getTableData(3, column) !== '-') {
								data.operationDays.push(day);
								data.operationTimings[day] = {1: {}, 2: {}};
								data.operationTimings[day][1].firstBus = getTableData(3, column);
								data.operationTimings[day][1].lastBus = getTableData(3, column + 1);
								if (data.terminals.length === 2) {
									data.operationTimings[day][2].firstBus = getTableData(3, column);
									data.operationTimings[day][2].lastBus = getTableData(3, column + 1);
								} else {
									delete data.operationTimings[day][2];
								}
							}
						}
						if (!this.isNightService(service)) {
							handleOperationSpecs(2, 'Weekdays');
							handleOperationSpecs(4, 'Saturdays');
							handleOperationSpecs(6, 'Sundays');
						} else {
							var day = 'Fridays, Saturdays and eves of P.Hs';
							var timings = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').textContent`).split(/-/).filter(Boolean).map(e=>e.trim());
							data.operationDays.push(day);
							data.operationTimings[day] = {
								1: {
									firstBus: timings[0], lastBus: timings[1]
								}
							};
						}
						function getFreqData(row, id) {
							return dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(${row}) .subhead:nth-child(${id})').textContent`);
						}
						function getFreq(id) {
							return dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) td:nth-child(${id})').textContent`);
						}
						if (!this.isNightService(service)) {
							for (var i = 2; i < 6; i++) {
								var timing = getFreqData(3, i);
								data.frequency[timing] = {};
								for (var dir = 1; dir <= data.terminals.length; dir++) {
									data.frequency[timing][dir] = getFreq(i).split(/ minutes/).filter(Boolean)[dir - 1];
								}
							}
						} else {
							var timing = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').textContent`).split(/-/).filter(Boolean).map(e=>e.trim()).join();
							data.frequency[timing] = {};
							data.frequency[timing][1] = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)').textContent`).split(/ minutes/).filter(Boolean);
						}
						function getStopList(direction) {
							var query = direction === 1 ? '#calculateFareDir1 > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) tr' : 'form[name=calculateFareDir2] > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) tr';
							return Array.from(dom.window.eval(`document.querySelectorAll('${query}')`)).slice(3, -1).filter(element => {
								return !element.querySelector('.subhead2')
							}).map(element => {
								return {
									distance: element.children[0].textContent.trim(),
									busStopCode: element.children[1].textContent.trim(),
									busStopName: element.children[2].textContent.substring(3)
								};
							}).filter(json => json.busStopName !== 'Non Stop' && !!json.distance);
						}
						data.stops = {};
						data.stops[1] = getStopList(1);
						if (data.terminals.length == 2) data.stops[2] = getStopList(2);

						cache.set(service, data);
						callback(data);
					});
				} else {
					callback(serviceData);
				}
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
