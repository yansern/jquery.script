/**
 * jquery.script
 * Script injection utility built on top $.Deferred() backbone.
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

    var self = function(options) {

        if (options===undefined) {
            return;
        }

        if (typeof options==="string") {
            options = {
                url: options
            }
        }

        var script = new Script(options);

        return script;
    };

    var Script = function(options) {

        var script = $.extend(this, options);

        script.manager = $.Deferred();

        $.extend(script, script.manager.promise());

        script.load();
    };

    var head = document.getElementsByTagName( "head" )[0],
        baseElement = document.getElementsByTagName("base")[0];

    $.extend(Script.prototype, {

        type: "text/javascript",

        async: false,

        charset: "UTF-8",

        insert: function() {

            var node = this.node;

            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
        },

        remove: function() {

            var node = this.node;

            // Handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            head.removeChild(node);
        },

        load: function() {

            var script = this,
                node;

            script.startTime = new Date();

            script.node = node = document.createElement('script');

            script.insert();

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
                charset : script.charset,
                src     : script.url
            });

        },

        ready: function(event) {

            var script = this,
                node = script.node;

            if (event.type==="load" || /loaded|complete/.test(node.readyState)) {

                script.complete.call(script, event);

                script.manager.resolve();
            }
        },

        error: function(event) {

            var script = this;

            script.complete.call(script, event);

            script.remove();

            script.manager.reject();
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

})();
