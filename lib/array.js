var array = {
	contains: function(array, element) {
		for (var i = 0, il = array.length; i < il; i++) {
			if (array[i] === element) {
				return true;
			}
		}
		return false;
	},
	isArray: function(array) {
		return Object.prototype.toString.call(array) === '[object Array]';
	},
	unique: function(array) {
		var seenElements = {};
		var unique = [];
		var index = 0;
		var element;
		for (var i = 0, il = array.length; i < il; i++) {
			element = array[i];
			if (seenElements[element] !== 1) {
				seenElements[element] = 1;
				unique[index++] = element;
			}
		}
		return unique;
	}
};