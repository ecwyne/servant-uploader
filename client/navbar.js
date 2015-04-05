Template.navbar.helpers({
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

Template.navbar.events({
	'click .setServantBtn': function (e){
		Session.set('servant', this);
		Servant.servant = this;
	}
});