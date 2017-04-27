const Router = require('express').Router,
	TransitLink = require('../lib/transit-link.js');

const api = Router(),
	transitLinkAPI = new TransitLink()

api.get('/:service', (req, res) => {
	var busService = req.params.service;
	transitLinkAPI.getBusServiceData(busService, (busService => {
		if (!busService) res.jsonError({
			error: 'Bus service not found'
		}); else {
			delete busService.stops;
			res.json(busService);
		}
	}));
});

api.get('/:service/stops', (req, res) => {
	var busService = req.params.service;
    transitLinkAPI.getBusServiceData(busService, (busService => {
        if (!busService) res.jsonError({
            error: 'Bus service not found'
        }); else {
            delete busService.operationDays;
            delete busService.operationTimings;
            delete busService.terminals;
            delete busService.frequency;
			delete busService.operator;
            res.json(busService);
        }
    }));

});

module.exports = {
	router: api,
	mountPath: '/bus/services/info'
}
