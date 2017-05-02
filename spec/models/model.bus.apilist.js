const BusAPIListModel = require('../../models/BusAPIListModel');

describe('The API Lister model', () => {
    it('should return a list of APIs', () => {
	var model = new BusAPIListModel();
	model.getAPIList(apis => {
	    expect(apis.paths).toBeDefined();
	});
    });
    it('should return a description of each API', () => {
	var model = new BusAPIListModel();
        model.getAPIList(apis => {
            expect(apis.availablePaths).toBeDefined();
        });
    });
});
