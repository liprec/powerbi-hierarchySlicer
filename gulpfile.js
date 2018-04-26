var gulp = require('gulp');
var del = require('del');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var zip = require('gulp-zip');

gulp.task('build', () => {
    // Clean dist folder
    del.sync(['dist']);
    // TypeScript 'compile'
    gulp.src('resources/*.ts')
        .pipe(gulp.dest('dist/resources'));
    // JavaScript minify
    gulp.src('resources/*.js')
        .pipe(minify({
            ext: {
                min: ".js"
            },
            noSource: true
        }))
        .pipe(gulp.dest('dist/resources'));
    // Css minify
    gulp.src('resources/*.css')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('dist/resources'));
    // Images
    gulp.src('resources/*.png')
        .pipe(gulp.dest('dist/resources'));
    // PbiViz file
    gulp.src('pbiviz.json')
        .pipe(rename('package.json'))
        .pipe(gulp.dest('dist'));
});

gulp.task('package', () => {
    // Zip to .pbiviz file
    gulp.src('dist/**')
        .pipe(zip('HierarchySlicer.pbiviz'))
        .pipe(gulp.dest('.'));
});