this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
// find the first document in the Documents colleciton and send back its id
  Template.editor.helpers({
    docid:function(){
      var doc = Documents.findOne();
      if (doc){
        return doc._id;
      }
      else {
        return undefined;
      }
    }, 
    // template helper that configures the CodeMirror editor
    // you might also want to experiment with the ACE editor
    config:function(){
      return function(editor){
        editor.setOption("lineNumber", true);
        editor.setOption("theme","cobalt");
        editor.on("change", function(cm_editor, info){
          //console.log(cm_editor.getValue());
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingUser");
        });        
      }
    }, 
  });

  Template.editingUsers.helpers({
  	users:function(){
  		var doc, eusers, users;
  		doc = Documents.findOne();
  		if(!doc){return;} //no doc
  		eusers = EditingUsers.findOne({docid:doc._id});
  		if(!eusers){return;} //no users are editing currently
  		users = new Array();
  		var i = 0;
  		for(var user_id in eusers.users){
  			users[i] = eusers.users[user_id];
  			i++;
  		}
  		return users;
  	}
  })
}//end of is isClient block

if (Meteor.isServer) {
  Meteor.startup(function () {
    // startup code that creates a document in case there isn't one yet. 
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
}

Meteor.methods({
	addEditingUser:function(){
		var doc, user, eusers;
		doc = Documents.findOne();
		if(!doc){ return; } //no doc give up
		if(!this.userId){return;} //no logged in user give up
		//now we have a doc and possibly a user
		user = Meteor.user().profile;
		eusers = EditingUsers.findOne({docid:doc._id});
		if(!eusers){
			eusers = {
				docid:doc._id,
				users:{},
			};
		}
		user.lastEdit = new Date();
		eusers.users[this.userId] = user;
		EditingUsers.upsert({_id:eusers._id},eusers);
	}
})