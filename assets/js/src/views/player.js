var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

var View = {},
    Track = require("../models/track"),
    Tracks = require("../collections/tracks");

View = Backbone.View.extend({
    el: "#control-bar",
    ready: false, // when ready to start playing
    events: {
    },
    initialize: function(_options) {
        var options = (_options) ? _options : {};
        this.app = options.app;

        // collection
        this.tracks = new Tracks();

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
            cursorColor: '#aaa',
            cursorWidth: 1,
            height: 80,
            waveColor: '#588efb',
            progressColor: '#f043a4'
        });

        // When a track is loaded and ready to play
        this.wavesurfer.on("ready", function() {
            var model = self.tracks.where({ playing: true })[0],
                tags = model.get("tags"),
                duration;

            self.wavesurfer.play();
            duration = self.wavesurfer.getDuration();

            // covert art
            if (tags.picture === "assets/img/default.png") {
                $('#cover-back').css("background", "");
            } else {
                $('#cover-back').css("background-image", "url("+ tags.picture +")").css("background-repeat", "no-repeat").css("background-position", "center");
            }
            $('#cover-art-small').attr('src', tags.picture);

            
        });

    },

    /**
     *  set model to collection
     *
     *  @method _setUp 
     *  @param  {Obj} file
     *  @return  
     */
    _setUp: function(file) {
        var self = this,
            attr = {};

        attr.file = file;
        ID3.loadTags(file.name, function() {
            var tags = ID3.getAllTags(file.name),
                model;

            if (tags.picture) {
                tags.picture = self.getImgSrc(tags.picture);
            }

            attr.tags = tags;
            model = new Track(attr);
            self.tracks.add(model, {merge: true});

            if (!self.ready) {
                self.play(0);
                $('#container').removeClass('disabled');
                self.ready = true;
            }

        },{
            tags: ["artist", "title", "album", "picture"],
            dataReader: new FileAPIReader(file)
        });

    },

    /**
     *  Read file and Play it on browser
     *
     *  @method play 
     *  @param  {Number} number
     *  @return  
     */
    play: function(number) {
        var self = this,
            model, file;

        if (this.tracks.at(number)) {
            model = this.tracks.at(number);
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
     *  @param  {Function} onFinish
     *  @return  
     */
    reader: function(file, onFinish) {
        var reader = new FileReader();

        reader.onload = function(data) {
            onFinish(data);
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
    }

});

module.exports = View;