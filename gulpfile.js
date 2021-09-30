var gulp = require("gulp");
var browserify = require("browserify");
var fileinclude = require('gulp-file-include');
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var sass = require('gulp-sass')(require('sass'));
var ghPages = require('gulp-gh-pages');

var paths = {
  ts: ["src/main.ts", "src/metals.ts"],
  pages: ["src/*.html", "src/includes/*.html"],
  styles: ["src/scss/*.scss"]
};

function style() {
  return (
    gulp.src(paths.styles)
    .pipe(sass())
    .on("error", fancy_log)
    .pipe(gulp.dest('dist'))
  );
}

function copyHtml() {
  return gulp.src(paths.pages).pipe(fileinclude({
    prefix: '@@',
    basepath: '@file'
  })).pipe(gulp.dest("dist"));
}

function bundle() {
  return browserify({
    basedir: ".",
    debug: true,
    entries: paths.ts,
    cache: {},
    packageCache: {},
  }).plugin(tsify)
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

function watch() {
  gulp.watch(paths.styles, style);
  gulp.watch(paths.pages, copyHtml);
  gulp.watch(paths.ts, bundle);
}

gulp.task("default", gulp.series(style, copyHtml, bundle));

/**
 * Push build to gh-pages
 */
gulp.task('deploy', () => gulp.src('./dist/**/*').pipe(ghPages()));

exports.watch = watch
