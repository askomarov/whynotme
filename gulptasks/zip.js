import gulp from 'gulp';
import del from 'del';
import zipPlugin from 'gulp-zip';

export const zip = () => {
  del(`./build.zip`)

  return gulp.src(`build/**/*.*`, {})
    .pipe(zipPlugin(`build.zip`))
    .pipe(gulp.dest('./'))
}
