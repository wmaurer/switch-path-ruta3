import * as ruta3 from 'ruta3';
import * as flattenDeep from 'lodash.flattenDeep';

function removeTrailingSlash(s: string) {
    return s.replace(/\/$/, '');
}

function extractRoutes(routes: Object){
    return Object.keys(routes)
        .map(key => {
            switch (typeof routes[key]) {
                case 'object':
                    return extractRoutes(routes[key])
                        .map(x => flattenDeep(x).map(y => ({ key: removeTrailingSlash(key + y.key), fn: y.fn })));
                case 'function':
                    return [{ key, fn: routes[key] }];
                default:
                    return [{ key, fn: () => routes[key] }];
            }
        });
}

export function switchPath(sourcePath: string, routes: Object) {
    sourcePath = sourcePath === '/' ? sourcePath : removeTrailingSlash(sourcePath);

    const router = ruta3();

    flattenDeep(extractRoutes(routes))
        .forEach(x => router.addRoute(x.key, x.fn));

    const match = router.match(sourcePath);

    if (!match) return { path: null, value: null };

    const params = Object.keys(match.params)
        .reduce((array, key) => [...array, match.params[key]], []);

    return { path: sourcePath, value: match.action(...params) };
}
