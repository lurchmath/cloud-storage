
/*
 * This file is the build process for this repository.
 *
 * It begins by importing all the gulp modules needed to do the tasks below.
 */
var gulp = require( 'gulp' );
var htmlmin = require( 'gulp-htmlmin' );
var embed = require( 'gulp-embed' );
var uglify = require( 'gulp-uglify' );
var each = require( 'gulp-each' );
var rename = require( 'gulp-rename' );
var concat = require( 'gulp-concat' );
var addsrc = require( 'gulp-add-src' );

/*
 * Any client will need to import our scripts.  The main one is the
 * cloud-storage.js file itself, which we compile here, from the source
 * folder to the release folder.
 *
 * This is a simple minification of the source file, with one additional
 * step.  We embed the entire dialog.{html,css,js} content as a single,
 * base64-encoded string at the top of the compiled file, so that it can be
 * used programmatically to fill an iframe, without the need for those three
 * files to be present in the same folder.
 */
gulp.task( 'build-main-script', function () {
    return gulp.src( 'source/dialog.html' )
               // embed dialog.{js,css} into dialog.html, then minify
               .pipe( embed() )
               .pipe( htmlmin( { collapseWhitespace : true,
                                 removeComments : true,
                                 minifyJS : true,
                                 minifyCSS : true } ) )
               // manually base64 encode the result as a JS string variable
               .pipe( each( function ( content, file, callback ) {
                   callback( null,
                       'var dialogHTML = "data:text/html;base64,' +
                       ( new Buffer( content ).toString( 'base64' ) ) +
                       '";' );
               } ) )
               // prepend this onto cloud-storage.js and make it use the var
               .pipe( addsrc.append( 'source/cloud-storage.js' ) )
               .pipe( concat( 'cloud-storage.js' ) )
               .pipe( each( function ( content, file, callback ) {
                   callback( null,
                       content.replace( "'./dialog.html'", "dialogHTML" ) );
               } ) )
               // minify and output
               .pipe( uglify() )
               .pipe( gulp.dest( 'release/' ) );
} );

/*
 * Any client will need to import our scripts.  In addition to the
 * cloud-storage.js file built by the process above, there are also a
 * handful of "backends" that reside in their own .js files, so that clients
 * can import exactly the subset they need, and no more.  We compile those
 * here, also from the source folder to the release folder.
 */
gulp.task( 'minify-backends', function () {
    return gulp.src( 'source/*-backend.js' )
               .pipe( uglify() )
               .pipe( gulp.dest( 'release/' ) );
} );

/*
 * A client who chooses to use the Dropbox backend will need a page in their
 * own web space to which to direct the Dropbox login procedure.  We provide
 * the file dropbox-login.html that receives that redirection from Dropbox
 * and emits the messages that the scripts in dropbox-backend.js need to
 * access the user's Dropbox.  The user will need a copy of thta file in
 * the same folder as the page importing cloud-storage.js.
 *
 * This build task just copies the dropbox-login.html page to the release
 * folder, from which clients who need it can download it.  But while we're
 * at it, we might as well minify its contents.
 */
gulp.task( 'minify-login-page', function () {
    return gulp.src( 'source/dropbox-login.html' )
               .pipe( htmlmin( { collapseWhitespace : true,
                                 removeComments : true,
                                 minifyJS : true } ) )
               .pipe( gulp.dest( 'release/' ) );
} );

/*
 * This repository contains an example/ folder to show how to use the tools
 * provided.  This task just copies the minified login page from the release
 * folder to the example folder.
 */
gulp.task( 'build-example', [ 'minify-login-page' ], function () {
    return gulp.src( 'release/dropbox-login.html' )
               .pipe( gulp.dest( 'example/' ) );
} );

/*
 * The default build task is to do everything.
 */
gulp.task( 'default', [ 'build-main-script',
                        'minify-backends',
                        'minify-login-page',
                        'build-example' ] );
