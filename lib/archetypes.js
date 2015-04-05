Archetypes = new Mongo.Collection('archetypes');

if (Meteor.isServer){
	Archetypes.remove({});
	for (archetype in ServantAPI.archetypes){
		if (archetype != 'image'){
			Archetypes.insert({
				name: archetype,
				json: mapObject(ServantAPI.instantiate(archetype), function (val, key){
					return typeof val == 'string' ? encodeURIComponent(val) : encodeURIComponent(JSON.stringify(val));
				})
			});
		}
	}
	Meteor.publish(null, function(){
		return Archetypes.find();
	})
}

function mapObject(obj, iteratee){
	for (i in obj){
		obj[i] = iteratee(obj[i]);
	}
	return obj;
}