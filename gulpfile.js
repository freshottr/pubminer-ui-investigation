// Compiles less files to ./public/css
var gulp = require("gulp"),
    less = require("gulp-less"),
    plumber = require("gulp-plumber"),
    path = require("path");

gulp.task('less', function () {
    gulp.src('less/**/*.less')
        .pipe(plumber())
        .pipe(less({
            paths: [path.join('bower_components')]
        }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('default',  ['less']);
