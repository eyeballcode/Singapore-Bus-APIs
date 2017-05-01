const Controller = require('./Controller'),
    BusTimingsAPIModel = require('../models/BusTimingsAPIModel'),
    BusAPIListModel = require('../models/BusAPIListModel'),
    ActiveBusServicesModel = require('../models/ActiveBusServicesModel'),
    TransitLinkModel = require('../models/TransitLinkModel');

class BusAPIController extends Controller {

    constructor() {
        super();

        this.busTimingsAPIModel = new BusTimingsAPIModel(),
            this.busAPIListModel = new BusAPIListModel(),
            this.activeBusServicesModel = new ActiveBusServicesModel(),
            this.transitLinkModel = new TransitLinkModel(db);

        this.get('/', this.apiListAPI);
        this.get('/timings/:busStop', this.arrivalsAPI);
        this.get('/services/active', this.activeServicesAPI);
        this.get('/services/:service/info', this.serviceInfoAPI);
        this.get('/services/:service/stops', this.serviceStopsAPI);
        this.get('/services/:service/:direction/isActive', this.activeQueryAPI);
        this.get('/services/list', this.serviceListAPI);
    }

    get(path, callback) {
        this.router.get(path, callback.bind(this));
    }

    serviceListAPI(req, res) {
        this.transitLinkModel.getAllServices(services => {
            res.json(services);
        });
    }

    activeQueryAPI(req, res) {
        this.activeBusServicesModel.isServiceActive(req.params.service, req.params.direction, (isActive, asOf) => {
            if (isActive === null)
                res.status(500).json({
                    error: 'Server is currently building data!'
                });
            else
                res.json({
                    isActive: isActive,
                    asOf: asOf
                });
        });
    }

    serviceStopsAPI(req, res) {
        this.transitLinkModel.getServiceStops(req.params.service, info => {
            res.json(info);
        });
    }

    serviceInfoAPI(req, res) {
        this.transitLinkModel.getServiceInfo(req.params.service, info => {
            res.json(info);
        });
    }

    activeServicesAPI(req, res) {
        this.activeBusServicesModel.getActiveBusServices(services => {
            if (!services.currentlyActiveServices) {
                res.status(500).json({
                    error: 'Server is currently building data!'
                });
            } else res.json(services);
        });
    }

    apiListAPI(req, res) {
        this.busAPIListModel.getAPIList(list => {
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

        this.busTimingsAPIModel.getBusStopTimings(busStop, timings => {
            res.json(timings);
        });
    }

    static get mountPoint() {
        return "/bus";
    }

}

module.exports = BusAPIController;
