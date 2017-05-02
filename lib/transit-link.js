const JSDOM = require('jsdom').JSDOM,
    request = require('request');

class TransitLink {

    constructor(database, requester) {
        this.serviceInfo = database.collection('service-info');
        this.meta = database.collection('service-meta');
	this.request = requester || request;
    }

    requester(url, callback) {
	this.request(url, callback);
    }

    isNightService(service) {
        return service.toString().startsWith('NR') || service.toString().endsWith('N');
    }

    getServiceGuideDOM(service, callback) {
        this.requester('http://www.transitlink.com.sg/eservice/eguide/service_route.php?service=' + service, (err, res) => {
            if (res.body.indexOf('The service number that you have entered is not valid') !== -1) {
                callback(null);
                return;
            }
            callback(new JSDOM(res.body, {
                runScripts: 'outside-only'
            }));
        });
    }

    getServiceOperator(dom) {
        return dom.window.eval(`document.getElementsByClassName('company')[0].textContent`);
    }

    getServiceInfoTable(dom, row, column) {
        return dom.window.eval(`(document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(${row}) > td:nth-child(${column})') || {textContent:null}).textContent`);
    }

    getServiceTerminals(service, dom) {
        if (this.isNightService(service)) {
            return [this.getServiceInfoTable(dom, 2, 1)];
        } else {
            var terminals = [];
            var terminal1 = this.getServiceInfoTable(dom, 3, 1),
                terminal2 = this.getServiceInfoTable(dom, 4, 1);
            terminals.push(terminal1);
            if (terminal2) terminals.push(terminal2);
            return terminals;
        }
    }

    getServiceFLBuses(dom, operationSpecs, day, direction, column) {
        if (!operationSpecs.operationTimings[day])
            operationSpecs.operationTimings[day] = {};
        operationSpecs.operationTimings[day][direction] = {};
        operationSpecs.operationTimings[day][direction].firstBus = this.getServiceInfoTable(dom, 2 + direction, column)
        operationSpecs.operationTimings[day][direction].lastBus = this.getServiceInfoTable(dom, 2 + direction, column)
        return operationSpecs;
    }

    getServiceOperationDetails(dom, service, directionCount) {
        var operationSpecs = {
            operationDays: [],
            operationTimings: {}
        };
        if (!this.isNightService(service)) {
            var picking = [
                [2, 'Weekdays'],
                [4, 'Saturdays'],
                [6, 'Sundays'],
            ];
            for (let dataSet of picking) {
                var column = dataSet[0],
                    day = dataSet[1];
                if (this.getServiceInfoTable(dom, 3, column) !== '-') {
                    operationSpecs.operationDays.push(day);
                    operationSpecs = this.getServiceFLBuses(dom, operationSpecs, day, 1, column);
                    if (directionCount === 2)
                        operationSpecs = this.getServiceFLBuses(dom, operationSpecs, day, 2, column);
                }
            }
        } else {
            var operationDay = 'Fridays, Saturdays and eves of PHs';
            var timings = this.getServiceInfoTable(dom, 2, 2).split(' - ');
            operationSpecs.operationDays = [operationDay];
            operationSpecs.operationTimings[operationDay] = {
                1: {
                    firstBus: timings[0],
                    lastBus: timings[1]
                }
            };
        }
        return operationSpecs;
    }

    getFrequencyPeriod(dom, column) {
        return dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(3) .subhead:nth-child(${column})').textContent`);
    }

    getFrequencyTimings(dom, column) {
        var frequency = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) td:nth-child(${column})').textContent`);
        var directions = frequency.split(' minutes').filter(Boolean);
        var frequencies = {};
        for (var direction = 1; direction <= directions.length; direction++) {
            var minMax = directions[direction - 1].split(' - ');
            frequencies[direction] = {
                min: minMax[0],
                max: minMax[1] || minMax[0]
            };
        }
        return frequencies
    }

    getServiceFrequency(dom, service, terminalCount) {
        var frequency = {};
        if (!this.isNightService(service)) {
            for (var column = 2; column < 6; column++) {
                var timings = this.getFrequencyPeriod(dom, column);
                frequency[timings] = this.getFrequencyTimings(dom, column);
            }
        } else {
            var timings = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').textContent`).split(/-/).filter(Boolean).map(e => e.trim()).join(' - ');
            var freq = dom.window.eval(`document.querySelector('#Content-eservice > article:nth-child(2) > section:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)').textContent`).split(/ minutes/)[0];
            frequency[timings] = {
                1: {
                    min: freq,
                    max: freq
                }
            };
        }
        return frequency;
    }

    getStopsForDirection(dom, direction) {
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

    getServiceStops(dom, directionCount) {
        var stops = {};
        for (var direction = 1; direction <= directionCount; direction++) {
            stops[direction] = this.getStopsForDirection(dom, direction);
        }
        return stops;
    }

    getServiceData(service, callback) {
        this.getServiceGuideDOM(service, dom => {
            if (!dom) callback(dom);
            else {
                var operator = this.getServiceOperator(dom);
                var terminals = this.getServiceTerminals(service, dom);
                var operationSpecs = this.getServiceOperationDetails(dom, service, terminals.length);
                var frequency = this.getServiceFrequency(dom, service, terminals.length);
                var stops = this.getServiceStops(dom, terminals.length);
                var data = {
                    operator: operator,
                    terminals: terminals,
                    frequency: frequency,
                    operationDetails: operationSpecs,
                    stops: stops
                };
                callback(data);
            }
        });

    }

    getBusServiceData(service, callback) {
        this.serviceInfo.find({
            service: service
        }).next((err, serviceData) => {
            if (!serviceData) {
                this.getServiceData(service, data => {
                    if (!data) callback(data)
                    else {
                        data.asOf = new Date();
                        data.type = 'auto';
                        data.service = service;
                        this.serviceInfo.insert(data, (err) => {});
                        callback(data);
                    }
                });
            } else {
                if ((new Date() - serviceData.asOf) > 86400000 && serviceData.type === 'auto') {
                    this.serviceInfo.remove({
                        service: serviceData
                    }, () => {
                        this.getBusServiceData(service, callback);
                    });
                } else
                    callback(serviceData);
            }
        });
    }

    getServiceListDOM(callback) {
        this.requester('http://www.transitlink.com.sg/eservice/eguide/service_idx.php', (err, res) => {
            callback(new JSDOM(res.body, {
                runScripts: 'outside-only'
            }));
        });
    }

    getBusServiceList(callback) {
        this.getServiceListDOM(dom => {
            var services = dom.window.eval(`Array.from(document.querySelectorAll('option')).filter(e=>e.value!='-').map(e=>e.value)`).sort();
            callback({
                services: services
            });
        });
    }

    listAllBusServices(callback) {
        this.meta.find({
            type: 'service-list'
        }).next((err, services) => {
            if (!services) {
                this.getBusServiceList(services => {
                    services.type = 'service-list';
                    services.asOf = new Date();
                    this.meta.insert(services);
		    delete services.type;
                    callback(services);
                });
            } else {
                if ((new Date() - services.asOf) > 86400000) {
                    this.meta.remove({
                        type: 'service-list'
                    }, () => {
                        this.listAllBusServices(callback);
                    });
                } else {
                    delete services._id;
                    delete services.asOf;
                    delete services.type;
                    callback(services);
                }
            }
        });
    }

}

module.exports = TransitLink;
