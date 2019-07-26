// this collection stores all the documents 
this.Documents = new Mongo.Collection("documents");
// this collection stores sets of users that are editing documents
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
  // return the id of the first document you can find
  Template.editor.helpers({
    docid:function(){
      setupCurrentDocument();
      return Session.get("docid");
      if (doc){
        return doc._id;
      }
      else {
        return undefined;
      }
    }, 
    // configure the CodeMirror editor
    config:function(){
      return function(editor){
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "cobalt");
        // set a callback that gets triggered whenever the user
        // makes a change in the code editing window
        editor.on("change", function(cm_editor, info){
          // send the current code over to the iframe for rendering
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingUser");
        });        
      }
    }, 
  });

  Template.editingUsers.helpers({
    // retrieve a set of users that are editing this document
    users:function(){
      var doc, eusers, users;
      doc = Documents.findOne();
      if (!doc){return;}// give up
      eusers = EditingUsers.findOne({docid:doc._id});
      if (!eusers){return;}// give up
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users){
          users[i] = fixObjectKeys(eusers.users[user_id]);
          i++;
      }
      return users;
    }
  })

Template.navbar.helpers({
  documents:function(){
    return Documents.find({});
  }
})

Template.docMeta.helpers({
  document:function(){
    return Documents.findOne({_id:get("docid")})
  }
})

Template.editableText.helpers.({
  userCanEdit:function(doc,Collection){
    doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()})  ;
    if(doc){
      return true;
    }
    else{
      return false;
    }
  }
})


/////////
////events
/////////
Template.navbar.events({
  "click .js-add-doc":function(event){
    event.preventDefault();
    console.log("add new doc")
    if(!Meteor.users()){ user is not logged in
      alert("You need to login")
    }
    else {
      //they are logged in... lets insert a doc
      var id = Meteor.call("addDoc",function(err,res){
        if(!err){//all goood
             console.log("event callback got an id back"+res);
             Session.set("docid",res);
        }
      })
    }
  }
  
  "click .js-load-doc":function(event){
    Session.set("docid",res);
  }
})


}// end isClient...

if (Meteor.isServer) {
  Meteor.startup(function () {
    // insert a document if there isn't one already
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
}
// methods that provide write access to the data
Meteor.methods({
  //adding new documents
  addDoc:function(){
    var doc;
    if(!this.userId){//not logged in
      return;
    }
    else{
      doc = {owner:this.userId, createdOn: new Date(), title:"my new doc"};
      var id = Documents.insert(doc);
      console.log("adddoc docid"+id);
      return id;
    }
  },




  // allows changes to the editing users collection 
  addEditingUser:function(){
    var doc, user, eusers;
    doc = Documents.findOne();
    if (!doc){return;}// no doc give up
    if (!this.userId){return;}// no logged in user give up
    // now I have a doc and possibly a user
    user = Meteor.user().profile;
    eusers = EditingUsers.findOne({docid:doc._id});
    if (!eusers){// no editing users have been stored yet
      eusers = {
        docid:doc._id, 
        users:{}, 
      };
    }
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;
    // upsert- insert or update if filter matches
    EditingUsers.upsert({_id:eusers._id}, eusers);
  }
})

function setupCurrentDocument(){
  var doc;
  if(!session.get(docid)){ //no docid set yet
    doc = Documents.findOne();
    if(doc){
      Session.set("docid", doc._id);
    }

  }
}




// this renames object keys by removing hyphens to make the compatible 
// with spacebars. 
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}

  




