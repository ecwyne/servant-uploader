Meteor.methods({
	validateArchetype: function (name, arr){
		arr = _.flatten([arr]);
		var pass = [];
		var fail = [];
		_.each(arr, function (e, i){
			e = parser(e);
			ServantAPI.validate(name, e, function (err, data){
				if (err){
					fail.push({error: err, data: e});
				} else {
					pass.push(data);
				}
			});
		});
		return {pass: pass, fail: fail};
	}
})

function parser(instance){
	for (i in instance){
		if (isParsable(instance[i])){
			var parsed;
			try {
				parsed = JSON.parse(instance[i]);
			} catch (e){
				instance[i] = '["' + instance[i].substr(1, instance[i].length - 3) + '"]'
				parsed = JSON.parse(instance[i].replace(/\,\s?/g, '","'))
			}
			instance[i] = parsed;
		}
	}
	return instance;
}

function isParsable(string){
	try {
		JSON.parse(string);
		return true;
	} catch (e) {

	}
	if (string.toLowerCase() == 'false' || string.toLowerCase() == 'true')
		return true;
	if (string.length > 1 && string.substr(0,1) == '[' && string.substr(string.length -1, 1) == ']')
		return true;

	return false;
}