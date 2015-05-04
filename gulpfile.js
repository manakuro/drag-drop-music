var $ = require('gulp-load-plugins')(),
    watchify = require('watchify'),
    browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    assign = require('lodash.assign'),
    glob = require('glob'),
    browser = require("browser-sync");

/**
 *   server
 * 
 */
 gulp.task('server', function(){
    browser({
        server: {
            baseDir: "./"
        }
    });
 });

/**
 *   JS
 * 
 */
var srcfile = glob.sync('./assets/js/src/**/*.js'),
    browserify_op = {
        entries: srcfile, 
        debug: true,
        // detectGlobals: false,
        // builtins: []
    },
    options = assign({}, watchify.args, browserify_op),
    b = watchify(browserify(options).require(srcfile));

gulp.task('js', js_bundle);
function js_bundle() {
    return b.bundle()
            .on('error', $.util.log.bind($.util, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe($.sourcemaps.init({ loadMaps: true }))
            .pipe($.uglify())
            .pipe($.sourcemaps.write("./"))
            .pipe(gulp.dest('./assets/js/dist/'))
            .pipe(browser.reload({stream: true}));
}

/**
 *   CSS
 * 
 */
gulp.task('css', css_bundle);
function css_bundle() {
    return gulp.src('./assets/css/src/**/*.scss')
        .pipe($.plumber())
        .pipe($.frontnote({
            css: './css/style.css'
        }))
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./assets/css/dist'))
        .pipe(browser.reload({stream: true}));
}

/**
 *   default
 * 
 */
gulp.task('default', ['js'], function(){
    b.on('update', js_bundle);
    b.on('log', $.util.log);
    gulp.watch('./assets/css/src/**/*.scss', ['css']);
});