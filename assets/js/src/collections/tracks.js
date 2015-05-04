var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');
Backbone.$ = $;

var model;
// var model = require("../models/track");
var collection = Backbone.Collection.extend({
        model: model
    });

module.exports = collection;