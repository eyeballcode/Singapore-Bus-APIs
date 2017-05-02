const TransitLink = require('../lib/transit-link.js'),
    Model = require('./Model');

var noSuchService = {
    error: 'The service provided was invalid'
};

class TransitLinkModel extends Model {

    constructor(database, requester) {
        super();
	this.transitLinkAPI = new TransitLink(database, requester);
    }

    getServiceInfo(busService, callback) {
        this.transitLinkAPI.getBusServiceData(busService, (busService => {
            if (!busService) callback(noSuchService);
            else {
                delete busService.stops;
                delete busService._id;
                delete busService.type;
                delete busService.service;
                callback(busService);
            }
        }));
    }

    getServiceStops(busService, callback) {
        this.transitLinkAPI.getBusServiceData(busService, (busService => {
            if (!busService) callback(noSuchService);
            else {
                callback({
                    directions: busService.stops
                });
            }
        }));
    }

    getAllServices(callback) {
        this.transitLinkAPI.listAllBusServices(services => {
            callback(services);
        });
    }

}

module.exports = TransitLinkModel;
