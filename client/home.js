Template.home.helpers({
	archetypes: function(){
		return _.sortBy(Archetypes.find().map(function (e){
			return {
				name: e.name,
				dataURI: 'data:attachment/csv,' + Papa.unparse([e.json]).replace(/\n/g, '%0A')
			}
		}), function (e){return e.name});
	},
	passLength: function (){
		return Session.get('uploadPass') && Session.get('uploadPass').length;
	},
	failLength: function (){
		return Session.get('uploadFail') && Session.get('uploadFail').length;
	},
	hasUploaded: function(){
		return typeof Session.get('uploadPass') != 'undefined' && !Session.equals('uploadPass', '');
	},
	pairs: function (obj){
		return _.pairs(obj).map(function (e){return {
			key: e[0],
			value: JSON.stringify(e[1])
		}})
	},
	servant: function (){
		if (!Meteor.user())
			return;
		if (!Session.get('servant')){
			Session.set('servant', Meteor.user().profile.servants[0]);
			Servant.servant = Meteor.user().profile.servants[0];
		}
		return Session.get('servant') || {master: 'No Servants Available'};
	}
});

Template.home.events({
	'click .processUpload': processUpload,
	'click .retryBtn': parseFile,
	'click .clearBtn': function (){
		Session.set('uploadPass', '');
		Session.set('uploadFail', '');
		Session.set('type', '');
		$('#uploader').val('');
	},
	'click .setServantBtn': function (e){
		Session.set('servant', this);
		Servant.servant = this;
	}
});

Template.home.rendered = function (){
	$('#uploader').change(function (e) {
		Session.set('uploadPass', '');
		Session.set('uploadFail', '');
		if (e.currentTarget.files.length == 0)
			return;
		Session.set('type', e.currentTarget.files[0].name.split('.')[0])
		parseFile();
	});
}

function parseFile(){
	console.log('parsing file');
	$('#uploader').parse({
		config: {
			header: true, 
			complete: function (data){
				console.log(data);
				Meteor.call('validateArchetype', Session.get('type'), data.data, function (err, passfail){
					if (err){
						swal('Parse Error', 'An error occurred.\n' + err.error, 'error');
					} else {
						Session.set('uploadPass', passfail.pass);
						Session.set('uploadFail', passfail.fail);
						if (passfail.fail.length > 0){
							swal('Validation Error', 'Unable to validate records. See below for details\n\nYou are still able to upload the valid records if you choose.', 'error');
						} else {
							swal('Success', 'All records were successfully validated! Proceed to step 3!', 'success');
						}
					}
				});
			}
		},
		error: function (err, file, inputElem, reason){
			swal('Parse Error', 'An error occurred.\n' + reason, 'error');
		}
	});
}

function processUpload(){
	if (!Meteor.user()){
		swal('Log In', 'You must be logged in to upload records. Sign using the button above', 'info');
		return;
	}
	if (!Session.get('servant')){
		swal('No Servant', 'You must have a servant set up and selected to upload records', 'info');
		return;
	}
	if (!Archetypes.findOne({name: Session.get('type')})){
		swal('Unrecognized Archetype', 'Please change archetype to proceed', 'info');
		return;
	}
	Meteor.call('processUpload', Session.get('servant')._id, Session.get('type'), Session.get('uploadPass'), function (err, data){
		if (err){
			swal('Server Error', err.reason, 'error')
		} else {
			if (data.pass.length > 0 && data.fail.length == 0){
				swal('Success!', data.pass.length + ' ' + Session.get('type') + ' records were successfully saved', 'success');
				Session.set('uploadPass', '');
				Session.set('uploadFail', '');
				Session.set('type', '');
				$('#uploader').val('');
			}
			if (data.pass.length == 0 && data.fail.length > 0){
				Session.set('uploadFail', data.fail);
				swal('Errors!', 'No records were successfully saved, see below for details', 'error');				
			}
			if (data.pass.length > 0 && data.fail.length > 0){
				Session.set('uploadFail', data.fail);
				swal('Incomplete', 'Not all records were successfully saved. See below for details.', 'warning');
			}
		}
	})
}