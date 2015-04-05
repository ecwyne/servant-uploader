Meteor.methods({
	processUpload: function (servant, name, arr){
		var user = Meteor.users.findOne(this.userId)
		if (!user || !user.services.servant.accessToken)
			throw new Meteor.Error('not-authorized', 'You are not currently signed into a valid Servant account');
		var at = user.services.servant.accessToken;
		var pass = [];
		var fail = [];
		var Future = Npm.require('fibers/future');
		var future = new Future;
		var done = _.after(arr.length, function(){
			future.return({pass: pass, fail: fail});
		});
		_.each(arr, function (e){
			ServantAPI.saveArchetypeSync(at, servant, name, e, function (err, data){
				if (err){
					fail.push({error: err, data: e});
				} else {
					pass.push(data);
				}
				done();
			});
		});

		return future.wait();
	}
});