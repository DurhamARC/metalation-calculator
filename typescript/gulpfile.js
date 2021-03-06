const gulp = require("gulp");
const ts = require('gulp-typescript');
const tsProject = ts.createProject("tsconfig.json");
const browserify = require("browserify");
const fileinclude = require('gulp-file-include');
const source = require("vinyl-source-stream");
const watchify = require("watchify");
const tsify = require("tsify");
const fancy_log = require("fancy-log");
const sass = require('gulp-sass')(require('sass'));
const eslint = require('gulp-eslint-new');
const jest = require('gulp-jest').default;
const debug = require('gulp-debug');
const gulpStylelint = require('@ronilaukkarinen/gulp-stylelint');
const terser = require("gulp-terser");
const paths = {
  ts: ["src/main.ts", "src/metals.ts", "src/calculator.ts"],
  pages: ["src/*.html", "src/includes/*.html"],
  styles: ["src/scss/*.scss"],
  tests: ["src/?(*.)+(spec|test).+(ts|tsx|js)"],
  tsWpEdit: ["src/metals.ts"],
  wpFiles: ["dist/calculator.html", "dist/main.css", "dist/*.png"]
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

function copyImages() {
  return gulp.src('./src/includes/*.png')
   .pipe(gulp.dest('./dist'));
}

function bundle() {
  return browserify({
    basedir: ".",
    debug: false,
    entries: paths.ts,
    cache: {},
    packageCache: {},
  }).plugin(tsify)
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

function wpJs() {
  return gulp.src(paths.tsWpEdit)
    .pipe(tsProject())
    .pipe(gulp.dest("../metalation-calculator-wp/include"));
}

function wpMinify() {
  return gulp.src('dist/bundle.js')
    .pipe(terser())
    .pipe(gulp.dest("../metalation-calculator-wp/include"));
}

function wpCopy() {
  return gulp.src(paths.wpFiles)
    .pipe(gulp.dest("../metalation-calculator-wp/include"));
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

function lintScss() {

  return gulp
    .src(paths.styles)
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
}

gulp.task('lint', lint);

gulp.task('lint-scss', lintScss);

gulp.task('copy-images', copyImages);

gulp.task('jest', function () {
  return gulp.src(paths.tests).pipe(jest({
    "preprocessorIgnorePatterns": [
      "<rootDir>/dist/", "<rootDir>/node_modules/"
    ],
    "automock": false
  }));
});

gulp.task("default", gulp.series(lint, lintScss, style, copyHtml, copyImages, bundle));

gulp.task("wp", gulp.series(lint, lintScss, style, copyHtml, copyImages, wpJs, bundle, wpMinify, wpCopy));

exports.watch = watch
