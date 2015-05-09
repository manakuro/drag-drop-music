var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');
Backbone.$ = $;

var model = Backbone.Model.extend({
        defaults: {
            tags: {
                artist: "Unknown Artist",
                title: "Unknown",
                album: "",
                picture: "assets/img/default.png",
            },
            file: {},
            playing: false
        },
        initialize: function() {
        }
    });

module.exports = model;