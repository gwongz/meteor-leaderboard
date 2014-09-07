// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Members = new Meteor.Collection("members");

if (Meteor.isClient) {
  Session.set('sort_choice', 'score');

  // Set template variables
  Template.order.sort_by_name = function(){
    return Session.equals('sort_choice', 'name');
  };

  Template.order.sort_by_score = function(){
    return Session.equals('sort_choice', 'score');
  };
  // db query 
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  // db query
  // sort by descending score, breaking ties with ascending name 
  Template.leaderboard.members = function(){
    // return Members.find({}, {sort: {score: -1, name: 1}});
    var order = Session.equals('sort_choice', 'score') ? {score: -1, name: 1} : {name: 1, score: -1};
    // var order = Session.get('sort_by_score') ? {score: -1, name: 1} : {name: 1, score: -1};
    return Members.find({}, {sort: order});
  };

  // fills in template var {{selected_name}}
  Template.leaderboard.selected_name = function () {
    var member = Members.findOne(Session.get("selected_player"));
    return member && member.name;
    // var player = Players.findOne(Session.get("selected_player"));
    // return player && player.name;
  };

  // a session variable 
  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  // event handler 
  Template.leaderboard.events({
    'click input.inc': function () {
      Members.update(Session.get("selected_player"), {$inc: {score: 5}});
      // Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  Template.order.events({
    'click .name': function(){
      Session.set('sort_choice', 'name');
    },

    'click .score': function(){
      Session.set('sort_choice', 'score');
    }
  });

  Template.reset.events({
    'click .score_reset': function(){
      Meteor.call('resetScores', 0);
      // Set the 'admin' property on the document to true
      // {$set: {admin: true}}

      // Add 2 to the 'votes' property, and add "Traz"
      // to the end of the 'supporters' array
      // {$inc: {votes: 2}, $push: {supporters: "Traz"}}
    }
  });

  Template.reset_random.events({
    'click .score_random': function(){
      Meteor.call('resetRandom');
      // Meteor.call('resetScores', Math.floor(Random.fraction()*10)*5);
    }
  });



}

Meteor.methods({
  resetScores: function (score) {
    Members.update({}, 
      {$set: {score: score}},
      {multi:true});
  },

  resetRandom: function(){
    var members = Members.find({});
    members.forEach(function (m) {
      Members.update({_id: m._id}, {$set: {score: Math.floor(Random.fraction()*10)*5}});
    });
  },

      // var m = var race = RacesCollection.find({eventId: "e1"});
});

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {


    if (Members.find().count() === 0){
      var names = ["Sam",
                    "Gabrielle",
                    "Chris",
                    "Sergio"];
      for (var i = 0; i < members.length; i++)
        Members.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
