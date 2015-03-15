if (jQuery) {
    jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
        return function (elem) {
            return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
}

var erljs = {};

erljs.guid = function () {
    var ss4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};
erljs.xxxx = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.uriToObject = function (search) {
    return search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
        function (key, value) {
            return key === "" ? value : decodeURIComponent(value)
        }) : {}
};

erljs.QueryStringToJSON = function (query) {
    query = query || window.location.search.slice(1);
    var pairs = query.split('&'), result = {};
    pairs.forEach(function (pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return JSON.parse(JSON.stringify(result));
};

erljs.serialize = function(obj, prefix) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.shuffle = {
    fisher_yates: function (array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
    },

    naive_swap: function (array) {
        var n = array.length, i = -1, j;
        while (++i < n) {
            j = Math.floor(Math.random() * n);
            t = array[j];
            array[j] = array[i];
            array[i] = t;
        }
    },

    naive_swap_random: function (array) {
        var n = array.length, i = -1, j, k;
        while (++i < n) {
            j = Math.floor(Math.random() * n);
            k = Math.floor(Math.random() * n);
            t = array[j];
            array[j] = array[k];
            array[k] = t;
        }
    },

    sort_random: function (array) {
        array.sort(function () {
            return Math.random() - .5;
        });
    },

    order_random: function (array) {
        var random = array.map(Math.random);
        array.sort(function (a, b) {
            return random[a] - random[b];
        });
    },

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    google: function (o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.getOriginalOfImg = function (img_element) {
    var native = img_element.get(0);
    var width = native.naturalWidth, height = native.naturalHeight;
    if (width && height) {
        return {width: width, height: height}
    } else {
        var t = new Image();
        t.src = (img_element.attr ? img_element.attr("src") : false) || img_element.src;
        return {width: t.width, height: t.height}
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// makeClass - By John Resig (MIT Licensed)
erljs.makeClass = function () {
    return function (args) {
        if (this instanceof arguments.callee) {
            if (typeof this.init == "function")
                this.init.apply(this, args.callee ? args : arguments);
        } else
            return new arguments.callee(arguments);
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.csrf = {
    csrfSafeMethod: function (method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    },
    sameOrigin: function (url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    },

    getCookie: function (name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.range = function (start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof step == 'undefined') {
        step = 1;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }
    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
    return result;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// formatString('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
erljs.formatString = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
erljs.style = {
//http://stackoverflow.com/questions/754607/can-jquery-get-all-css-styles-associated-with-an-element
//Pass a jQuery object into css() and it will return an object, which you can then plug back into jQuery's $().css(), ex:
//
//var style = css($("#elementToGetAllCSS"));
//$("#elementToPutStyleInto").css(style);

    css: function (a) {
        var sheets = document.styleSheets, o = {};
        for (var i in sheets) {
            var rules = sheets[i].rules || sheets[i].cssRules;
            for (var r in rules) {
                if (a.is(rules[r].selectorText)) {
                    o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
                }
            }
        }
        return o;
    },

    css2json: function (css) {
        var s = {};
        if (!css) return s;
        if (css instanceof CSSStyleDeclaration) {
            for (var i in css) {
                if ((css[i]).toLowerCase) {
                    s[(css[i]).toLowerCase()] = (css[css[i]]);
                }
            }
        } else if (typeof css == "string") {
            css = css.split("; ");
            for (var i in css) {
                var l = css[i].split(": ");
                s[l[0].toLowerCase()] = (l[1]);
            }
        }
        return s;
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////

self.erljs = erljs;
