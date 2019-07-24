this.Documents = new Mongo.Collection("documents");


if (Meteor.isClient){

	Template.editor.helpers({
		docid:function(){
			console.log("doc id helper:");
			console.log(Documents.findOne());
			var doc = Documents.findOne();
			if(doc) {
				return doc._id;
			}
			else {
				return undefined;
			}
		}
		config:function(editor){
			return function(editor){
				editor.on("change", function(cm_editor, info))
				console.log(cm_editor.getValue());
				$('#viewer_iframe').contents().find("html").html(cm_editor.getValue());
			}
		}
	});

}

if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if(!Documents.findOne()) { //no documents yet
			Documents.insert({title:"my new document"});

		}
	})
}