Meteor.methods({
	processUpload: function (servant, name, arr){
		var user = Meteor.users.findOne(this.userId)
		if (!user || !user.services.servant.accessToken)
			throw new Meteor.Error('not-authorized', 'You are not currently signed into a valid Servant account');
		var at = user.services.servant.accessToken;
		var pass = [];
		var fail = [];
		_.each(arr, function (e){
			try {
				var res = ServantAPI.saveArchetypeSync(at, servant, name, e);
				pass.push(res);
			} catch (err){
				fail.push({error: err, data: e})
			}
		});

		return {pass: pass, fail: fail};
	}
});