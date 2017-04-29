const Controller = require('./Controller'),
	BusTimingsAPIModel = require('../models/BusTimingsAPIModel'),
	BusAPIListModel = require('../models/BusAPIListModel'),
	ActiveBusServicesModel = require('../models/ActiveBusServicesModel'),
	BusServiceInfoModel = require('../models/BusServiceInfoModel');

let busTimingsAPIModel = new BusTimingsAPIModel(),
	busAPIListModel = new BusAPIListModel(),
	activeBusServicesModel = new ActiveBusServicesModel(),
	busServiceInfoModel = new BusServiceInfoModel();

class BusAPIController extends Controller {

	constructor() {
		super();
		this.router.get('/', this.apiListAPI);
		this.router.get('/timings/:busStop', this.arrivalsAPI);
		this.router.get('/services/active', this.activeServicesAPI);
		this.router.get('/services/:service/info', this.serviceInfoAPI);
		this.router.get('/services/:service/stops', this.serviceStopsAPI)
	}

	serviceStopsAPI(req, res) {
		busServiceInfoModel.getServiceStops(req.params.service, info => {
			res.json(info);
		});
	}

	serviceInfoAPI(req, res) {
		busServiceInfoModel.getServiceInfo(req.params.service, info => {
			res.json(info);
		});
	}

	activeServicesAPI(req, res) {
		activeBusServicesModel.getActiveBusServices(services => {
			if (!services.currentlyActiveServices) {
				res.status(500).json({
					error: 'Server is currently building data!'
				});
			} else res.json(services);
		});
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
