const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const path = require("path");
const del = require('del');
const useref = require('gulp-useref');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const package = require('./package.json')
const iife = require("gulp-iife");
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minifyes = composer(uglifyes, console);
const fs = require('fs');
const replace = require('gulp-replace');
const gutil = require('gulp-util');


var destination = 'dist/';


gulp.task('clean', function () {
    return del('./' + destination + '**');
});

gulp.task('copy-files', function () {
    return gulp.src([
        'assets/font/**', 'assets/img/**', 'assets/img/**',


    ], {base: ".", nodir: true})
        .pipe(gulp.dest(destination));
});


// Static server
gulp.task('browser-sync', function (done) {

    browserSync.init({
        server: {
            baseDir: "./"
        },
        ui: false,
        browser: "google chrome"
    });

    done();
});

gulp.task('js', function (done) {
    var sources = ['app/app.js', 'app/**/*.js'];

    return gulp.src(sources, {base: '.'})
        .pipe(sourcemaps.init())
        .pipe(concat('assets/js/app.js'))
        .on('error', logError)
        .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/'}))
        .pipe(gulp.dest(destination));
});

gulp.task('dependencies', function (done) {
    gulp.src(['index.html'], {base: '.'})
        .pipe(useref({searchPath: '.'}))
        .pipe(gulp.dest(destination));
    setTimeout(function () {
        done();
    }, 1000)
});


gulp.task('scss', function () {
    function importer(url, prev, done) {
        if (url[0] === '~') {
            url = path.resolve('./node_modules', url.substr(1));
        } else if (url[0] === '/') {
            url = path.resolve(url.substr(1));
        }
        return {file: url};
    }

    return gulp.src('assets/css/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({importer: importer}))
        .on('error', logError)
        .pipe(sourcemaps.write({includeContent: false, sourceRoot: '/assets/css'}))
        .pipe(gulp.dest(destination + 'assets/css/'))
        .pipe(browserSync.stream());
});


function browserSyncReload(done) {
    browserSync.reload();
    done();
}


gulp.task('watch', gulp.series(gulp.parallel('scss', 'js'), function watch(done) {
    gulp.watch(['app/**/*.scss', 'assets/**/*css'], gulp.parallel('scss'));
    gulp.watch(['app/**/*.js'], gulp.series('js', browserSyncReload));
    gulp.watch(["app/**/*.html", "index.html"]).on('change', browserSync.reload);

    done();
}));


gulp.task('default', gulp.series('clean', 'copy-files', 'watch', 'browser-sync'));


function logError(error) {

    // If you want details of the error in the console
    console.log(error.toString());
    this.emit('end')
}


gulp.task('scripts-minify', gulp.series('js', 'dependencies', function minify(done) {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    del('./' + destination + 'assets/js/templates.js');
    return gulp.src(['assets/js/app.js'], {base: destination, cwd: destination})
        .pipe(iife({
            useStrict: false
        }))
        .pipe(minifyes().on('error', function (e) {
            console.log(e);
            //callback(e);
        }))
        .pipe(header(fs.readFileSync('header.txt', 'utf8'), {pkg: package}))
        .pipe(gulp.dest(destination));
}));


gulp.task('styles-minify', gulp.series(gulp.parallel('scss'), function () {
    del('./' + destination + 'assets/css/style.scss');
    return gulp.src(['assets/css/style.css'], {base: destination, cwd: destination})
    //.pipe(sourcemaps.init())
        .pipe(cleanCSS({
            level: {
                2: {
                    specialComments: 'none',
                    normalizeUrls: false
                }
            },
            //inline: ['local'],
            rebase: false
        }))
        //.pipe(sourcemaps.write())
        .pipe(header(fs.readFileSync('header.txt', 'utf8'), {pkg: package}))
        .pipe(gulp.dest(destination));
}));

gulp.task('production-replace', function (done) {
    function rndStr() {
        var x = '';
        while (x.length != 5) {
            x = Math.random().toString(36).substring(7).substr(0, 5);
        }
        return x;
    }

    var cacheBuster = rndStr();

    return gulp.src(['index.html', 'assets/js/app.js'], {
        base: destination,
        cwd: destination
    })
    //adding version to stop caching
        .pipe(replace('js/app.js', 'js/app.js?cs=' + cacheBuster))
        .pipe(replace('css/style.css', 'css/style.css?cs=' + cacheBuster))
        .pipe(replace('/dist/', '/'))
        .pipe(replace("/assets", 'assets'))

        .pipe(replace('debugInfoEnabled(!0)', 'debugInfoEnabled(false)'))
        .pipe(replace('[[version]]', package.version))

        .pipe(gulp.dest(destination));

});

gulp.task('distribute', gulp.series('clean', 'copy-files',
    gulp.parallel('styles-minify', 'scripts-minify'),
    'production-replace'
    )
);