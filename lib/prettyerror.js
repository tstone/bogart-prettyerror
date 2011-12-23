
var Mustache = require('mustache'),
    Q = require('promised-io/lib/promise'),
    template = ' \
        <!doctype html> \
        <html> \
            <head> \
                <title>Server Error: {{ error }}</title> \
                <link href="http://fonts.googleapis.com/css?family=Alfa+Slab+One|Open+Sans:400,300,600" rel="stylesheet" type="text/css"> \
                <style type="text/css"> \
                    html, body { height: 100%; } \
                    body { padding: 50px; font-size: 13px; font-family: \'Open Sans\', Arial, Helvetican, sans-serif; \
                        background: rgb(220,246,247); \
                        background: -moz-linear-gradient(top, rgba(220,246,247,1) 0%, rgba(255,255,255,1) 100%); \
                        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(220,246,247,1)), color-stop(100%,rgba(255,255,255,1))); \
                        background: -webkit-linear-gradient(top, rgba(220,246,247,1) 0%,rgba(255,255,255,1) 100%); \
                        background: -o-linear-gradient(top, rgba(220,246,247,1) 0%,rgba(255,255,255,1) 100%); \
                        background: linear-gradient(top, rgba(220,246,247,1) 0%,rgba(255,255,255,1) 100%); } \
                    h1 { font-family: \'Alfa Slab One\', sans-serif; font-size: 22px; font-weight: normal; color: #242520; margin-top: 0; margin-bottom: 10px; } \
                    h1 .actions { text-align: right; float: right; } \
                    h1 .actions a { display: inline-block; border-right: solid 1px #333; padding-right: 10px; margin-right: 5px; font-size: 11px; font-family: \'Open Sans\', Arial, Helvetican, sans-serif;  } \
                    h1 .actions a:last-child { border-right: 0; padding-right: 0; margin-right: 0; } \
                    h2 { background-color: rgb(220,246,247); padding: 15px; } \
                    a { text-decoration: none; color: #242520; } \
                    a:hover { text-decoration: underline; } \
                    hr { display: block; margin: 20px 0; visibility: hidden; } \
                    table { width: 100%; margin-left: 20px; } \
                    table .key { width: 20%; } \
                    table .value { width: 80% } \
                    .stack-trace { list-style-type: none; padding-left: 20px; margin: 20px 0; } \
                    .stack-trace li { list-style-type: none; margin-bottom: 8px; font-size: 13px; } \
                    .stack-trace li.native { opacity: 0.25; cursor: arrow; } \
                    .stack-trace li.native:hover { opacity: 0.75; } \
                    .stack-trace .loc { margin-left: 12px; font-weight: 700; } \
                </style> \
            </head> \
            <body> \
                <h1> \
                    <div class="actions"> \
                        <a href="http://stackoverflow.com/search?q=%5Bnodejs%5D+{{ error }}" target="_blank">Search StackOverflow</a> \
                        <a href="http://blekko.com/ws/+node.js+%22{{ error }}%22" target="_blank">Search Blekko</a> \
                    </div> \
                    Server Error: {{ error }} \
                </h1> \
                <ul class="stack-trace"> \
                    {{# stackTrace }} \
                        {{# file }} \
                            <li class="file">{{ source }}<span class="loc">{{ line }} : {{ column }}</span></a></li> \
                        {{/ file }} \
                        {{# native }} \
                            <li class="native">{{ source }}</li> \
                        {{/ native }} \
                    {{/ stackTrace }} \
                </ul> \
                <hr/> \
                {{# request }} \
                    <h1>Request</h1> \
                    <table> \
                        <tbody> \
                            <tr><td class="key">Method</td><td class="value">{{ method }}</td></tr> \
                            <tr><td class="key">Path</td><td class="value"><a href="{{ pathInfo }}">{{ pathInfo }}</a></td></tr> \
                            <tr><td class="key">Query String</td><td class="value">{{ queryString }}</td></tr> \
                        </tbody> \
                    </table> \
                {{/ request }} \
            </body> \
        </html> \
    ';

// error
function error(app, errorResponse) {

    errorResponse = errorResponse || function(err, req) {
        var context = {
            error: '',
            type: '',
            stackTrace: [],
            request: req || {}
        };

        if (typeof err === 'string') {
          context.error = err;
        } else if (err.message) {
          context.error = err.message;
          if (err.stack) {
            // Pattern match the stack trace string into an object
            context.type = (/^([A-Za-z]+):/).exec(err.stack)[1];
            var tracePattern = new RegExp('    at (.*):([\\d]+):([\\d]+)(\\))?', 'g'),
                match = tracePattern.exec(err.stack);
            while(match) {
                var step = {
                    source: match[1] + (match[4] || ''),
                    line: match[2],
                    column: match[3]
                };
                // Figure out if this is native code or a local file
                if (match[4]) {
                    step.native = true;
                } else {
                    step.file = true;
                }
                context.stackTrace.unshift(step);
                match = tracePattern.exec(err.stack);
            }
          }
        }

        return {
            status: 500,
            body: [Mustache.to_html(template, context)],
            headers: {
                'content-type': 'text/html'
            }
        };
    };

    if (typeof errorResponse !== 'function') {
        throw new Error('`errorResponse` parameter must be a function');
    }

    return function(req) {
      return Q.whenCall(
            function() { return app(req); },
            function(val) { return val; },
            function(err) { return errorResponse(err, req); }
        );
    };

};

// Exports
exports.middleware = {
    error: error,
    Error: error
};
