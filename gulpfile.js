const gulp = require("gulp");
const browserify = require("browserify");
const fileinclude = require('gulp-file-include');
const source = require("vinyl-source-stream");
const watchify = require("watchify");
const tsify = require("tsify");
const fancy_log = require("fancy-log");
const sass = require('gulp-sass')(require('sass'));
const eslint = require('gulp-eslint');
const jest = require('gulp-jest').default;
const debug = require('gulp-debug');
const paths = {
  ts: ["src/main.ts", "src/metals.ts"],
  pages: ["src/*.html", "src/includes/*.html"],
  styles: ["src/scss/*.scss"],
  tests: ["src/?(*.)+(spec|test).+(ts|tsx|js)"]
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

function lint() {
  return gulp.src(paths.ts.concat(paths.tests))
    .pipe(debug({title: 'Linting:'}))
    .pipe(eslint({fix:true}))
    .pipe(eslint.format())
    .pipe(gulp.dest(file => file.base))
    .pipe(eslint.failAfterError());
}

gulp.task('lint', lint);

gulp.task('jest', function () {
  return gulp.src(paths.tests).pipe(jest({
    "preprocessorIgnorePatterns": [
      "<rootDir>/dist/", "<rootDir>/node_modules/"
    ],
    "automock": false
  }));
});

gulp.task("default", gulp.series(lint, style, copyHtml, bundle));

exports.watch = watch
