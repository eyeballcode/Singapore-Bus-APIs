const Controller = require('./Controller'),
	BusTimingsAPIModel = require('../models/BusTimingsAPIModel'),
	BusAPIListModel = require('../models/BusAPIListModel');

let busTimingsAPIModel = new BusTimingsAPIModel(),
	busAPIListModel = new BusAPIListModel();

class BusAPIController extends Controller {

	constructor() {
		super();
		this.router.get('/', this.apiListAPI);
		this.router.get('/timings/:busStop', this.arrivalsAPI);
	}

	apiListAPI(req, res) {
		busAPIListModel.getAPIList(list => {
			res.json(list);
		});
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
