var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');
Backbone.$ = $;

$(function(){

    var model = Backbone.Model.extend({
        defaults: {
            name: "",
            age: 0,
            sex: "",
            height: 0
        }
    });

    var collection = Backbone.Collection.extend({
        model: model
    });

    var view = Backbone.View.extend({
        initialize: function(){
            this.collection = new collection([{ name: "1" }, {name: "2"}]);
            _.each(this.collection.models, function(model){
                console.log(model.toJSON());
            });
        }
    });

    new view();
});