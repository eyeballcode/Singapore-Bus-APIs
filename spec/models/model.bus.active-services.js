const ActiveBusServicesModel = require('../../models/ActiveBusServicesModel'),
    mockBusServices = require('../mock/bus-service-mock.js');

describe('The Active Bus Service model', () => {
    it('should return a list of active services', () => {
	var model = new ActiveBusServicesModel(mockBusServices);
	model.getActiveBusServices(services => {
	    expect(services.currentlyActiveServices).toBeDefined();
	    expect(services.currentlyActiveServices.length).toEqual(1);
	});
    });
    it('should match the form sDd', () => {
	var model = new ActiveBusServicesModel(mockBusServices);
        model.getActiveBusServices(services => {
	    expect(services.currentlyActiveServices[0].match(/(.+)D\{(.+)}/)).not.toBeNull();
	});
    });
    it('should allow querying of active services', () => {
	var model = new ActiveBusServicesModel(mockBusServices);
	model.isServiceActive('118', '1', isActive => {
	    expect(isActive).toEqual(true);
	});
	model.isServiceActive('985', '2', isActive => {
	    expect(isActive).toEqual(false);
	});
    });
});

