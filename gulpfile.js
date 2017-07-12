const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

const OUTPUT_DIR = 'build';
const CLIENT_OUTPUT = OUTPUT_DIR + '/public';

gulp.task('clean', () => {
    return gulp.src(OUTPUT_DIR, { read: false })
        .pipe(clean());
});

gulp.task('bundle-vendor', () => {
    return [
        gulp.src([
            'node_modules/angular/angular.js',
            'node_modules/angular-animate/angular-animate.js',
            'node_modules/socket.io-client/dist/socket.io.js'
        ])
            .pipe(concat('vendor.bundle.js'))
            .pipe(gulp.dest(CLIENT_OUTPUT)),
        gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap.css'
        ])
            .pipe(concat('vendor.bundle.css'))
            .pipe(gulp.dest(CLIENT_OUTPUT)),
        gulp.src('node_modules/bootstrap/dist/fonts/*')
            .pipe(gulp.dest(CLIENT_OUTPUT + '/fonts'))
    ];
});

gulp.task('bundle-main', () => {
    return [
        browserify('src/client/app.main.js').bundle()
            .pipe(source('main.bundle.js'))
            .pipe(gulp.dest(CLIENT_OUTPUT)),
        gulp.src('src/client/*.css')
            .pipe(concat('main.bundle.css'))
            .pipe(gulp.dest(CLIENT_OUTPUT)),
        gulp.src('src/client/*.html')
            .pipe(gulp.dest(CLIENT_OUTPUT))
    ];
});

gulp.task('build', ['bundle-vendor', 'bundle-main']);

gulp.task('watch', ['build'], () => {
    gulp.watch('src/client/**/*.*', ['build']);
});

gulp.task('serve', ['watch'], () => {
    nodemon({
        nodemon: require('nodemon'),
        script: 'src/server.js',
        ignore: ['node_modules/*', 'build/*', 'src/client/*']
    });
});
