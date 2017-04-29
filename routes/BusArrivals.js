const Router = require('express').Router,
	LTADataMall = require('lta-datamall')
	fs = require('fs'),
	path = require('path'),
	NodeCache = require('node-cache');

const BusTimingAPI = LTADataMall.BusTimingAPI,
	busTimingAPI = new BusTimingAPI(JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'))).accountKey),
	cache = new NodeCache({stdTTL: 15});

const api = Router();

api.get('/:busStop', (req, res) => {
	var busStop;
	try {
		busStop = parseInt(req.params.busStop);
	} catch (e) {
		res.jsonError({
			error: 'Invalid bus stop code'
		});
		return;
	}
	function sendData(busStop, res) {
		delete busStop.asOf;
		res.json(busStop);
	}
	cache.get(busStop, (err, stop) => {
		if (!err) {
			if (!stop) {
				busTimingAPI.getTimingForStop(busStop, stop => {
					stop.asOf = +new Date();
					stop.isCached = false;
					cache.set(busStop, stop, sendData.bind(this, stop, res));
				});
			} else {
				var now = +new Date();
				var difference = now - stop.asOf;
				stop.services.forEach(service => {
					stop.timings[service].buses = stop.timings[service].buses.map(bus => {
						bus.secondsToArrival = Math.floor(Math.max(0, (bus.arrival - now) / 1000));
						return bus;
					});
				});
				stop.isCached = true;
				sendData(stop, res);
			}
		}
	});
});

module.exports = {
	router: api,
	mountPath: '/bus/timings'
}
