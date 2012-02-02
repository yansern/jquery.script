/**
 * jquery.script
 * Script loader utility. Loads external script via script injection/XHR.
 * https://github.com/jstonne/jquery.script
 *
 * Copyright (c) 2012 Jensen Tonne
 * www.jstonne.com
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

$.script = (function(){


    var self = function() {

        var script = new Script(options);

        return script;
    };

    var Script = function(options) {

        var script = this;

        if ($.isPlainObject(params)) {
            $.extend(true, this, options);
        }

        return script.load();
    };

    $.extend(Script.prototype, {

        load: function() {

            var script = this,
                node;

            script.startTime = new Date();

            script.node = node = document.createElement('script');

            document.getElementsByTagName('head')[0].appendChild(node);

            // Create a reference to these proxied functions,
            // so that we can detach them from event listeners.
            script._ready = $.proxy(script.ready, script);
            script._error = $.proxy(script.error, script);

            // On IE9, addEventListener() does not necessary fire the onload event after
            // the script is loaded, attachEvent() method behaves correctly.
            if (node.attachEvent && !$.isOpera) {
                node.attachEvent("onreadystatechange", script._ready);
                node.attachEvent("onerror"           , script._error); // IE9 only.
            } else {
                node.addEventListener("load"         , script._ready, false);
                node.addEventListener("error"        , script._error, false);
            }

            $(node).attr({
                type    : script.type,
                async   : script.async,
                charset : "UTF-8",
                src     : script.url
            });

        },

        ready: function(event) {

            var script = this,
                node = script.node;

            if (event.type==="load" || /loaded|complete/.test(node.readyState)) {

                script.done && script.done();

                script.complete.call(script, event);
            }
        },

        error: function(event) {

            var script = this;

            script.fail && script.fail();

            script.complete.call(script, event);
        },

        complete: function() {

            var script = this,
                node = script.node;

            script.endTime = new Date();

            if (node.detachEvent && !$.isOpera) {
                node.detachEvent("onreadystatechange", script._ready);
                node.detachEvent("onerror"           , script._error);
            } else {
                node.removeEventListener("load"      , script._ready, false);
                node.removeEventListener("error"     , script._error, false);
            }
        }

    });

    return self;

});
