module.exports = function (params) {
	return function (req, res) {
		params.push(params.message);
	};
};
