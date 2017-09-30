/**
 * Created by zhijie.huang on 2017/7/19.
 */

const gulp = require('gulp');

gulp.task('default', () => {

});

// 处理不需要webpack打包的html，直接copy
gulp.task('simpleHtml', () => {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'));
});
