var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');
Backbone.$ = $;

var model = Backbone.Model.extend({
        defaults: {
            artist: "Unknown Artist",
            title: "Unknown",
            album: "",
            picture: "assets/img/default.png",
            playing: false
        },
        initialize: function() {
            console.log("model initialize");
        }
    });

module.exports = model;