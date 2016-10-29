"use strict";
var ruta3 = require('ruta3');
var flattenDeep = require('lodash.flattenDeep');
function removeTrailingSlash(s) {
    return s.replace(/\/$/, '');
}
function extractRoutes(routes) {
    return Object.keys(routes)
        .map(function (key) {
        switch (typeof routes[key]) {
            case 'object':
                return extractRoutes(routes[key])
                    .map(function (x) { return flattenDeep(x).map(function (y) { return ({ key: removeTrailingSlash(key + y.key), fn: y.fn }); }); });
            case 'function':
                return [{ key: key, fn: routes[key] }];
            default:
                return [{ key: key, fn: function () { return routes[key]; } }];
        }
    });
}
function switchPath(sourcePath, routes) {
    sourcePath = sourcePath === '/' ? sourcePath : removeTrailingSlash(sourcePath);
    var router = ruta3();
    flattenDeep(extractRoutes(routes))
        .forEach(function (x) { return router.addRoute(x.key, x.fn); });
    var match = router.match(sourcePath);
    if (!match)
        return { path: null, value: null };
    var params = Object.keys(match.params)
        .reduce(function (array, key) { return array.concat([match.params[key]]); }, []);
    return { path: sourcePath, value: match.action.apply(match, params) };
}
exports.switchPath = switchPath;
//# sourceMappingURL=switch-path.js.map