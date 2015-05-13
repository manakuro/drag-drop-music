var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

var View = {},
    TrackList = require("./tracklist"),
    Track = require("../models/track");

View = Backbone.View.extend({
    el: "#player",
    timer: 0,
    is_shuffle: false,
    is_repeat: false,

    events: {
        "click #next-button": "next",
        "click #previous-button": "prev",
        "click #play-button": "playbt",
        "click #pause-button": "pause",
        "click #stop-button": "stop",
        "click #shuffle-button": "shuffle",
        "click #repeat-button": "repeat",

        "click #track-details": "toggleTrackList",
        "toggleTrackList #track-details": "toggleTrackList",
        "click #cover-art": "triggerHideTrackList"
    },
    initialize: function(_options) {
        var options = (_options) ? _options : {};

        // referencies
        this.app = options.app;
        this.utility = this.app.utility;

        // view
        this.tracklist = new TrackList({
            app: this.app,
            player: this
        });

        // libraries
        this.wavesurfer = Object.create(WaveSurfer);
        this.wavesurferSetUp();
    },
    render: function() {},

    /**
     *  Set up wavesurfer
     *
     *  @method wavesurferSetUp 
     *  @param  types
     *  @return  
     */
    wavesurferSetUp: function() {
        var self = this;

        // initialize
        this.wavesurfer.init({
            container: "#wave",
            cursorColor: "#aaa",
            cursorWidth: 1,
            height: 80,
            waveColor: "#588efb",
            progressColor: "#f043a4"
        });

        // When a track is loaded and ready to play
        this.wavesurfer.on("ready", function() {
            var model = self.tracklist.tracks.where({ playing: true })[0],
                tags = model.get("tags"),
                duration;

            self.wavesurfer.play();
            duration = self.wavesurfer.getDuration();

            // covert art
            if (tags.picture === "assets/img/default.png") {
                $("#cover-back").css("background", "");
            } else {
                $("#cover-back").css("background-image", "url("+ tags.picture +")").css("background-repeat", "no-repeat").css("background-position", "center");
            }
            $("#cover-art-small").attr("src", tags.picture);

            // artist and title.
            $("#track-desc").html("<b>" + tags.title + "</b> by " + tags.artist);

            // timer
            $("#current").text("0:00");
            $("#total").text(self.utility.secToMini(duration));
            clearInterval(self.timer);
            self.timer = setInterval(function(){
                $("#current").text(self.utility.secToMini(self.wavesurfer.getCurrentTime()));
            }, 1000);

            // track list
            self.tracklist.highlightPlayingTrack();

        });

        // When the track finished playing
        this.wavesurfer.on("finish", function(){
            var number,
                current = self.tracklist.tracks.where({ playing: true })[0];

            // shuffle
            if (self.is_shuffle) {
                number = Math.floor(Math.random() * self.tracklist.tracks.length);
            } else if (self.is_repeat) {
                number = self.tracklist.tracks.indexOf(current);
            } else {
                number = self.tracklist.tracks.indexOf(current) + 1;
            }

            self.play(number);
        });

    },

    /**
     *  set model to collection
     *
     *  @method setUp 
     *  @param  {Obj} file
     *  @return  
     */
    setUp: function(file) {
        var self = this,
            attr = {},
            model;

        model = new Track();
        attr = model.toJSON();
        attr.file = file;
        model.set(attr);
        this.tracklist.tracks.add(model);

        ID3.loadTags(file.name, function() {
            var tags = ID3.getAllTags(file.name),
                defalut_tags;

            // console.log("loaded: ", file.name);
            defalut_tags = $.extend(true, {}, attr.tags);

            if (tags.picture) {
                tags.picture = self.getImgSrc(tags.picture);
            }
            attr.tags = _.extend(defalut_tags, tags);
            model.set(attr);

            // play just only first track
            if (self.tracklist.tracks.at(0).cid === model.cid) {
                self.play(0);
                $('#container').removeClass('disabled');
            }

        },{
            tags: ["artist", "title", "album", "picture"],
            dataReader: new FileAPIReader(file)
        });

    },

    /**
     *  Read file and play it on browser
     *
     *  @method play 
     *  @param  {Number} number
     *  @return  
     */
    play: function(number) {
        var self = this,
            model, file;

        if (this.tracklist.tracks.at(number)) {

            // reset
            this.tracklist.tracks.each(function(track){
                track.set({ playing: false });
            });

            model = this.tracklist.tracks.at(number);
            model.set({playing: true});

            file = model.get("file");
            this.reader(file, function(){
                self.wavesurfer.loadBlob(file);
            });
        }
    },

    /**
     *  Read files
     *
     *  @method reader 
     *  @param  {Obj} file
     *  @param  {Function} callback
     *  @return  
     */
    reader: function(file, callback) {
        var reader = new FileReader();

        reader.onload = function(data) {
            callback(data);
        };

        reader.readAsDataURL(file);
    },

    /**
     *  get image resource
     *  fork ID3 Reader (https://github.com/aadsm/JavaScript-ID3-Reader)
     *
     *  @method getImgSrc 
     *  @param  {Obj} image
     *  @return  
     */
    getImgSrc: function(image) {
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
            base64String += String.fromCharCode(image.data[i]);
        }
        return "data:" + image.format + ";base64," + window.btoa(base64String);
    },

    /**
     *  Plays next track
     *
     *  @method next 
     *  @param  {Obj} e
     *  @return  
     */
    next: function(e) {
        var current_model = this.tracklist.tracks.where({ playing: true })[0],
            current_index = this.tracklist.tracks.indexOf(current_model);

        this.play(current_index + 1);
    },

    /**
     *  Plays previous track
     *
     *  @method prev 
     *  @param  {Obj} e
     *  @return  
     */
    prev: function(e) {
        var current_model = this.tracklist.tracks.where({ playing: true })[0],
            current_index = this.tracklist.tracks.indexOf(current_model);

        this.play(current_index - 1);
    },

    /**
     *  Play current track
     *
     *  @method playbt 
     *  @param  {Obj} e
     *  @return  
     */
    playbt: function(e) {
        this.wavesurfer.play();
    },

    /**
     *  Pause track
     *
     *  @method pause 
     *  @param  {Obj} e
     *  @return  
     */
    pause: function(e) {
        this.wavesurfer.playPause();
    },

    /**
     *  Stop track
     *
     *  @method stop 
     *  @param  {Obj} e
     *  @return  
     */
    stop: function() {
        this.wavesurfer.stop();
    },

    /**
     *  Shuffle track
     *
     *  @method shuffle 
     *  @param  {Obj} e
     *  @return  
     */
    shuffle: function(e) {
        e.preventDefault();

        var target = $(e.target);

        target.toggleClass("active");
        this.is_shuffle = target.hasClass("active") === true;
    },

    /**
     *  Repeat track
     *
     *  @method repeat 
     *  @param  {Obj} e
     *  @return  
     */
    repeat: function(e) {
        e.preventDefault();

        var target = $(e.target);

        target.toggleClass("active");
        this.is_repeat = target.hasClass("active") === true;
    },

    /**
     *  Show or close track list
     *
     *  @method toggleTrackList 
     *  @param  {Obj} e
     *  @return  
     */
    toggleTrackList: function(e){
        var bar = $("#expand-bar");

        if (bar.hasClass("hidden")) {
            bar.removeClass("hidden");
            $(e.target).attr("title", "Hide Playlist");
        } else {
            bar.addClass("hidden");
            $(e.target).attr("title", "Show Playlist");
        }
    },

    /**
     *  trigger hide operation in track list
     *
     *  @method triggerHideTrackList 
     *  @param  types
     *  @return  
     */
    triggerHideTrackList: function(e) {
        e.preventDefault();
        if (!$("#expand-bar").hasClass("hidden")) {
            $("#track-details").trigger("toggleTrackList");
        }
    },

    /**
     *  Reset play list
     *
     *  @method reset 
     *  @param  types
     *  @return  
     */
    reset: function() {
        this.tracklist.tracks.reset();
        this.wavesurfer.empty();
        clearInterval(this.timer);

        $('#cover-back').css("background", "");
        $('#cover-art-small').attr('src', 'assets/img/folder.png');
        $('#expand-bar').addClass('hidden');
        $('#track-desc').html('There are no tracks loaded in the player.');
        $('#current').text('-');
        $('#total').text('-');
        $('#container').addClass('disabled');
    },

});

module.exports = View;