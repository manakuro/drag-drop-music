var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

$(function(){
    "use strict";

    // modules (view, model, collection)
    var Player = require("./player");

    var App = Backbone.View.extend({
        el: "body",
        events: {
            "dragover #container": "dragOver",
            "dragleave #drop-zone": "dragLeave",
            "dragover #drop-zone": "dragOverZone",
            "drop #drop-zone": "drop"
        },

        initialize: function() {
            this.player = new Player({ app: this });
        },

        render: function() {
        },

        /**
         *  Drag over body
         *
         *  @method dragOver 
         *  @param  {Obj} e
         *  @return  
         */
        dragOver: function(e) {
            e.preventDefault();
            e.stopPropagation();

            $("#drop-zone").removeClass("hidden");
        },

        /**
         *  Drag leave event
         *
         *  @method dragLeave 
         *  @param  {Obj} e
         *  @return  
         */
        dragLeave: function(e) {
            e.preventDefault();
            e.stopPropagation();

            $("#drop-zone").addClass("hidden");
        },

        /**
         *  Drag over #drop-zone
         *
         *  @method dragOverZone 
         *  @param  {Obj} e
         *  @return  
         */
        dragOverZone: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "copy";
        },

        /**
         *  Get file data on drop
         *
         *  @method drop 
         *  @param  {Obj} e
         *  @return  
         */
        drop: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var self = this,
                items, item,
                files;

            // chrome
            if (e.originalEvent.dataTransfer.items) {
                items = e.originalEvent.dataTransfer.items;
                _.each(items, function(item){
                    var entry = item.webkitGetAsEntry();
                    self.traverseEntry(entry);
                });

            // Other browser
            } else {
                files = e.originalEvent.dataTransfer.files;
                _.each(files, function(file){
                    if (file.type.match(/audio\/(mp3|mpeg)/)) {
                        self.player._setUp(file);
                    }
                });
            }

            $("#drop-zone").addClass("hidden");
        },

        /**
         *  Get file from folder
         *  + recursively
         *  + only works in chrome
         *
         *  @method traverseEntry 
         *  @param  {Obj} entry
         *  @return  
         */
        traverseEntry: function(entry) {
            var self = this,
                model,
                dir_reader;

            if (entry.isFile) {
                entry.file(function(file){
                    if (file.type.match(/audio\/mp3/)) {
                        self.player._setUp(file);
                    }
                });

            } else if (entry.isDirectory) {
                dir_reader = entry.createReader();
                dir_reader.readEntries(function (entries) {
                    _.each(entries, function(_entry){
                        self.traverseEntry(_entry);
                    });
                });
            }
        }

    });

    new App();
});