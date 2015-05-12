var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

var View = Backbone.View.extend({
    el: "#expand-bar",
    rendering_limit: 4,
    show_more: false,
    show_more_models: [],
    search_timer: "",

    pre_templated: {
        tracklist: "#tmp-tracklist"
    },
    templates: {},

    events: {
        "click .track": "playTrack",
        "click .remove-track": "removeTrack",
        "keyup #search_box": "search",
        "submit #search": "search",
        "click #show_more": "showMore"
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

    /**
     *  Render track list
     *
     *  @method render 
     *  @param  {Obj} _options {
     *          {Obj}    models: ()
     *          {String} html:   ()
     *  }
     *  @return  
     */
    render: function(_options) {
        var options = (_options) ? _options : {},
            self = this,
            models = options.models || this.player.tracks.slice(0, this.rendering_limit),
            html = options.html || "";

        if (this.show_more) {
            Array.prototype.push.apply(models, this.show_more_models);
        }

        if (html === "") {
            _.each(models, function(model){
                var attr = model.get("tags");

                attr.cid = model.cid;
                attr.active = (model.get("playing")) ? "active" : "";
                html += self.templates.tracklist(attr);
            });

            if (!this.show_more && this.show_more_models.length > 0) {
                html += '<li class="track show_more"><span id="show_more">Show '+ this.show_more_models.length +' More</span>';
            }
        }

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

        // When submit event is occured
        if (e.type === "submit") e.preventDefault();

        var self = this,
            val = $(e.target).val(),
            filtered = [],
            model, tags,
            string, html = "";

        // clear
        clearTimeout(this.search_timer);
        this.show_more_models = [];
        this.show_more = false;

        this.search_timer = setTimeout(function(){
            val = val.toLowerCase();
            for (var i = 0; i < self.player.tracks.length; i++) {
                model = self.player.tracks.models[i];
                tags = model.get("tags");
                string = tags.artist + " " + tags.title;

                string = string.toLowerCase();
                if (string.indexOf(val) !== -1) {
                    if (!self.show_more && filtered.length >= self.rendering_limit) {
                        self.show_more_models.push(model);
                        continue;
                    }

                    filtered.push(model);
                }
            }

            self.render({
                models: filtered
            });
        }, 200);
    },

    /**
     *  Render the rest of searched tracks
     *
     *  @method showMore 
     *  @param  types
     *  @return  
     */
    showMore: function() {
        this.show_more = true;
        this.render();
    },

    /**
     *  Highlight a playing track
     *
     *  @method highlightPlayingTrack 
     *  @param  types
     *  @return  
     */
    highlightPlayingTrack: function() {
        var model = this.player.tracks.where({ playing: true })[0];

        $("#tracklist").find(".track").removeClass("active");
        $("#tracklist_row_" + model.cid).addClass("active");
    }

});

module.exports = View;