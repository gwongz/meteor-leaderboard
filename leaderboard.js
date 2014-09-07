// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players" and a MongoDB collection named "members".

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
  // db query returns all of the players
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  // db query returns all of the members
  // sort by descending score, breaking ties with ascending name 
  Template.leaderboard.members = function(){
    var order = Session.equals('sort_choice', 'score') ? {score: -1, name: 1} : {name: 1, score: -1};
    return Members.find({}, {sort: order});
  };

  // set {{selected_name}} to value of session variable
  Template.leaderboard.selected_name = function () {
    var member = Members.findOne(Session.get("selected_player"));
    return member && member.name;
  };


  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  // event handler 
  Template.leaderboard.events({
    // $inc is Mongo modifier (aka Mongo update operator) for incrementing scores property
    'click input.inc': function () {
      Members.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    // decrement scores property by 5
    'click input.dec': function(){
      Members.update(Session.get("selected_player"), {$inc: {score: -5}});

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

    }
  });

  Template.reset_random.events({
    'click .score_random': function(){
      Meteor.call('resetRandom');
    }
  });



}

Meteor.methods({
  resetScores: function (score) {
    // set the score property on the document to score var
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

});

// On server startup, create some members if the database is empty.
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
