const BusTimingsAPIModel = require('../models/BusTimingsAPIModel'),
    mockTimings = require('./bus-timing-mock');

const stop49121 = mockTimings(49121),
    stop28009 = mockTimings(28009);

describe('The bus timings API', () => {

    it('should return some wrapped results', () => {
        var api = new BusTimingsAPIModel(stop28009);
        api.getBusStopTimings(28009, timings => {
            expect(timings.services).toBeDefined();
            expect(timings.timings).toBeDefined();
            expect(timings.timings[66].avaliableBuses).toEqual(2);
            expect(timings.timings[66].buses[0].secondsToArrival).toBeGreaterThanOrEqual(0);
            expect(timings.timings[66].buses[1].secondsToArrival).toBeGreaterThanOrEqual(0);
        });
    });

    it('should not cache results on first call', () => {
        var api = new BusTimingsAPIModel(stop28009);
        api.getBusStopTimings(28009, timings => {
            expect(timings.isCached).toEqual(false);
        });
    });

    it('should cache for more than one call', () => {
        var api = new BusTimingsAPIModel(stop28009);
        api.getBusStopTimings(28009, timings => {
            expect(timings.isCached).toEqual(false);
            api.getBusStopTimings(28009, timings => {
                expect(timings.isCached).toEqual(true);
            });
        });
    });

    it('should return updated timings for cached results', done => {
        var api = new BusTimingsAPIModel(mockTimings(42161));
        api.getBusStopTimings(42161, timings => {
            var timing = timings.timings[985].buses[0];
            var originalTiming = timing.secondsToArrival;
            expect(originalTiming >= 299 && originalTiming <= 300).toBeTruthy();
            setTimeout(() => {
                api.getBusStopTimings(42161, timings => {
                    timing = timings.timings[985].buses[0];
                    var newTiming = timing.secondsToArrival;
                    expect(newTiming >= 298 && newTiming < 300).toEqual(true); // Caused by 1 sec delay
                    done();
                });
            }, 1000);
        });
    });
});