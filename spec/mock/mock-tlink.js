const fs = require('fs'),
	path = require('path');

var svc925 = fs.readFileSync(path.join(__dirname, 'svc925.html')).toString();
var svcNR5 = fs.readFileSync(path.join(__dirname, 'svcNR5.html')).toString();
var svcNo = fs.readFileSync(path.join(__dirname, 'svcno.html')).toString();
var allSvcs = fs.readFileSync(path.join(__dirname, 'allsvcs.html')).toString();

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
