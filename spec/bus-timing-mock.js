
module.exports = (stopID) => {
	var now = +new Date();
	var serviceList;

	switch(stopID) {
		case 42161: // Blk 18
			serviceList = [{
				ServiceNo: '985',
				NextBus: {
					EstimatedArrival: '',
					Load: 'Seats Avaliable',
					Feature: 'WAB'
				},
				SubsequentBus: {
					EstimatedArrival: '',
					Load: '',
					Feature: ''
				},
				SubsequentBus3: {
					EstimatedArrival: '',
					Load: '',
					Feature: ''
				}
			}];
			break;
		case 49121: // Aft. SMRT Kranji Dpt, testing 925
			serviceList = [{
				ServiceNo: '925',
				NextBus: {
					EstimatedArrival: new Date(+new Date() + 5 * 60000).toISOString(),
					Load: 'Seats Avaliable',
					Feature: 'WAB'
				},
				SubsequentBus: {
					EstimatedArrival: '',
					Load: '',
					Feature: ''
				},
				SubsequentBus3: {
					EstimatedArrival: '',
					Load: '',
					Feature: ''
				}
			}];
			break;
		case 28009: // Jurong East Int.
            serviceList = [{
                ServiceNo: '66',
                NextBus: {
                    EstimatedArrival: new Date(+new Date() -5000).toISOString(),
                    Load: 'Seats Avaliable',
                    Feature: 'WAB'
                },
                SubsequentBus: {
                    EstimatedArrival: new Date(+new Date() + 5000).toISOString(),
                    Load: 'Seats Avaliable',
                    Feature: 'WAB'
                },
                SubsequentBus3: {
                    EstimatedArrival: '',
                    Load: '',
                    Feature: ''
                }
            }];

	}

	return (busStop, callback) => {
		if (stopID === 42161) {
			serviceList[0].NextBus.EstimatedArrival = new Date(now + 5 * 60000).toISOString();
		}
		callback({
			Services: serviceList
		});
	};
};
