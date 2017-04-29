const Controller = require('./Controller'),
	BusTimingsAPIModel = require('../models/BusTimingsAPIModel');

var busTimingsAPIModel = new BusTimingsAPIModel();

class BusAPIController extends Controller {

	constructor() {
		super();
		this.router.get('/timings/:busStop', this.arrivalsAPI);
	}

	arrivalsAPI(req, res) {
		var busStop;
		try {
			busStop = parseInt(req.params.busStop);
		} catch (e) {
			res.jsonError({
				error: 'Invalid bus stop code'
			});
			return;
		}

		busTimingsAPIModel.getBusStopTimings(busStop, timings => {
			res.json(timings);
		});
	}

	static get mountPoint() {
		return "/bus";
	}

}

module.exports = BusAPIController;
