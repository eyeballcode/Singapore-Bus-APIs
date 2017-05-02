const fs = require('fs'),
	path = require('path');

var folder = path.join(__dirname, 'htmls');

var svc925 = fs.readFileSync(path.join(folder, 'svc925.html')).toString();
var svcNR5 = fs.readFileSync(path.join(folder, 'svcNR5.html')).toString();
var svcNo = fs.readFileSync(path.join(folder, 'svcno.html')).toString();
var allSvcs = fs.readFileSync(path.join(folder, 'allsvcs.html')).toString();

module.exports = (type) => {
    switch (type) {
	case 1: // service info
	    return (url, cb) => {
		    cb(null, {body: svc925});
		}
	case 2:
	    return (url, cb) => {
		    cb(null, {body: allSvcs});
		}
	case 3:
	    return (url, cb) => {
		    cb(null, {body: svcNR5});
		}
	case 4:
	    return (url, cb) => {
		    cb(null, {body: svcNo});
		}
    }
};
