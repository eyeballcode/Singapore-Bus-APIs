const LTADataMall = require('lta-datamall')
fs = require('fs'),
    path = require('path'),
    NodeCache = require('node-cache'),
    Model = require('./Model');

const BusTimingAPI = LTADataMall.BusTimingAPI,
    configs = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));

class BusTimingsAPIModel extends Model {

    constructor(requester) {
        super();
        this.busTimingAPI = new BusTimingAPI(configs.accountKey, {
            requester: requester
        });
        this.cache = new NodeCache({
            stdTTL: 15
        });
    }

    getBusStopTimings(busStop, callback) {
        this.cache.get(busStop, (err, stop) => {
            if (!err) {
                if (!stop) {
                    this.busTimingAPI.getTimingForStop(busStop, stop => {
                        stop.asOf = +new Date();
                        stop.isCached = false;
                        this.cache.set(busStop, stop, () => {
                            delete stop.asOf;
                            callback(stop);
                        });
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
                    delete stop.asOf;
                    callback(stop);
                }
            }
        });
    }
}

module.exports = BusTimingsAPIModel;