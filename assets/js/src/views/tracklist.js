var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

var View = Backbone.View.extend({
    el: "#expand-bar",

    pre_templated: {
        tracklist: "#tmp-tracklist"
    },
    templates: {},

    events: {
        "click .track": "playTrack",
        "click .remove-track": "removeTrack",
        "keydown #search": "search",
        "submit #search": "search"
    },
    initialize: function(_options) {
        var options = (_options) ? _options : {};

        // referencies
        this.app = options.app;
        this.player = options.player;
        this.utility = this.player.utility;

        // load template
        this.loadTemplate();

    },
    loadTemplate: function() {
        var self = this;

        _.each(this.pre_templated, function(template, key){
            self.templates[key] = _.template($(template).html());
        });
    },
    render: function() {
        var self = this,
            html = '';

        this.player.tracks.each(function(model){
            var attr = model.get("tags");

            attr.cid = model.cid;
            attr.active = (model.get("playing")) ? "active" : "";
            html += self.templates.tracklist(attr);
        });

        $("#tracklist").html(html);
    },

    /**
     *  Play track
     *
     *  @method playTrack 
     *  @param  {Obj} e
     *  @return  
     */
    playTrack: function(e){
        var cid = $(e.target).closest(".track").data("cid"),
            current_model = this.player.tracks.get(cid),
            number = this.player.tracks.indexOf(current_model);

        this.player.play(number);
    },

    /**
     *  Remove track
     *
     *  @method removeTrack 
     *  @param  {Obj} e
     *  @return  
     */
    removeTrack: function(e) {
        var target = $(e.target).closest(".track"),
            cid = target.data("cid"),
            current_model = this.player.tracks.get(cid),
            number;

        this.player.tracks.remove(current_model);
        target.slideUp("normal", function(){
            $(this).remove();
        });

        if (current_model.get("playing")) {
            if (this.player.tracks.length === 0) {
                this.player.reset();
                return;
            }
            number = this.player.tracks.indexOf(current_model) + 1;
            this.player.play(number);
        }
    },

    /**
     *  Search track list
     *
     *  @method search 
     *  @param  {Obj} e
     *  @return  
     */
    search: function(e) {
        e.preventDefault();

        console.log("seach");


    }

});

module.exports = View;