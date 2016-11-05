var mongoose = require('mongoose');

module.exports = mongoose.model('parking', {
	entry: {type: Object, default: {}}
});