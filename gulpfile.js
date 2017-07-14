const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const es = require('event-stream');
const logFile = function (es) {
    return es.map(function (file, cb) {
        gutil.log(file.path);
        return cb();
    });
};

const OUTPUT_DIR = 'build';
const CLIENT_OUTPUT = OUTPUT_DIR + '/public';
const BUILD_TEMP = OUTPUT_DIR + '/temp';

const babelClientConfig = {
    "presets": [
        [ "env", {
            "targets": {
                "browsers": ["last 2 versions"]
            }
        } ]
    ]
};

gulp.task('clean', () => del([OUTPUT_DIR]));

gulp.task('bundle-vendor-polyfill', () => {
    return gulp.src('node_modules/babel-polyfill/dist/polyfill.js')
        .pipe(uglify())
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('bundle-vendor-js', () => {
    return gulp.src([
        'node_modules/angular/angular.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/socket.io-client/dist/socket.io.js'
    ])
        .pipe(concat('vendor.bundle.js'))
        .pipe(uglify())
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('bundle-vendor-css', () => {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/font-awesome/css/font-awesome.css'
    ])
        // Saving the css to same folder, so we can use a
        // commom base path to rebase the assets.
        .pipe(gulp.dest(BUILD_TEMP + '/css'))
        .pipe(concat('vendor.bundle.css'))
        .pipe(cleanCSS({ rebaseTo: BUILD_TEMP }))
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('bundle-vendor-fonts', () => {
    return gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest(CLIENT_OUTPUT + '/fonts'));
});

gulp.task('bundle-client-js', () => {
    return browserify('src/client/app.main.js')
        .bundle()
        .pipe(source('main.bundle.js'))
        .pipe(buffer())
        .pipe(babel(babelClientConfig))
        .pipe(uglify())
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('bundle-client-css', () => {
    return gulp.src('src/client/*.css')
        .pipe(concat('main.bundle.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('bundle-client-assets', () => {
    return gulp.src('src/client/*.html')
        .pipe(gulp.dest(CLIENT_OUTPUT));
});

gulp.task('build-vendor', [
    'bundle-vendor-polyfill',
    'bundle-vendor-js',
    'bundle-vendor-css',
    'bundle-vendor-fonts'
]);

gulp.task('build-client', [
    'bundle-client-js',
    'bundle-client-css',
    'bundle-client-assets'
]);

gulp.task('serve', ['build-vendor', 'build-client'], () => {
    gulp.watch('src/client/**/*.*', ['build-client'])
        .on('change', (event) => {
            console.log('A client file was ' + event.type + ', rebuilding...');
        });

    nodemon({
        nodemon: require('nodemon'),
        script: 'src/server.js',
        ignore: ['node_modules/*', 'build/*', 'src/client/*']
    });
});
