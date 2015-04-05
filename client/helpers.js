Template.registerHelper('getSessionVar', function (varName){
	return Session.get(varName);
});

Template.registerHelper('getLength', function (arr){
	return arr.length || _.keys(arr).length;
});