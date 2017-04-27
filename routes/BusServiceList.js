const Router = require('express').Router,
	TransitLink = require('../lib/transit-link.js');

const api = Router(),
	transitLinkAPI = new TransitLink()


api.get('/', (req, res) => {
	transitLinkAPI.listAllBusServices(services => {
		res.json({
			services: services
		});
	});
});

module.exports = {
	router: api,
	mountPath: '/bus/services/list'
}
