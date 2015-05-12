var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone");
Backbone.$ = $;

module.exports = Backbone.View.extend({
    el: "body",
    initialize: function() {
    },

    /**
     *  Returns a formated time in (minitues : seconds)
     *
     *  @method secToMini 
     *  @param  {Number} time (seconds)
     *  @return  
     */
    secToMini: function(time, delimitor) {
        var minitues = Math.floor(Math.round(time) / 60),
            seconds = this.zeroFill(Math.floor(time - minitues * 60), 2);
        
        delimitor = delimitor || ":";
        return minitues + delimitor + seconds;
    },

    /**
     *  Returns pad digits with leading zeros in a string
     *
     *  @method zeroFill
     *  @param  {Int} 　　 num   ()
     *  @param  {Int} 　　 digit ()
     *  @return {String}  num　　()
     */
    zeroFill: function(num, digit) {
        var i;
        num = (typeof num !== "string") ? num.toString(10): num;

        for (i = 0; i < digit - 1; i++) {
            num = "0" + num;                             
        }

        return num.slice(-digit);
    },

    /**
     *  Returns converted a one byte character
     *
     *  @method toOneByteChars
     *  @param  {String} val ()
     */
    toOneByteChars:function(val) {        
        if ( val === '' || typeof val === 'undefined' ) return val;

        return val.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });        
    },

    /**
     *  Returns a formated string
     *
     *  @method formatString 
     *  @param  {String} val()
     *  @return {String} val() 
     */
    formatString: function(val) {
        if ( val === '' || typeof val === 'undefined' ) return val;

        val = this.toOneByteChars(val);
        val = val.replace(/^\s+|\s+$/g, '');
        val = val.toLowerCase();
        return val;
    }

});