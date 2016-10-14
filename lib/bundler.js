const rollup = require( 'rollup' );

// used to track the cache for subsequent bundles
//var cache;

rollup.rollup({
  // The bundle's starting point. This file will be
  // included, along with the minimum necessary code
  // from its dependencies
  entry: 'main.js'//,
  // If you have a bundle you want to re-use (e.g., when using a watcher to rebuild as files change),
  // you can tell rollup use a previous bundle as its starting point.
  // This is entirely optional!
  //cache: cache
}).then( function ( bundle ) {
  // Generate bundle + sourcemap
  var result = bundle.generate({
    // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    //format: 'es'
  });

  // Cache our bundle for later use (optional)
  //cache = bundle;

  fs.writeFileSync( 'bundle.js', result.code );

  // Alternatively, let Rollup do it for you
  // (this returns a promise). This is much
  // easier if you're generating a sourcemap
  //bundle.write({
  //  format: 'cjs',
  //  dest: 'bundle.js'
  //});
});
