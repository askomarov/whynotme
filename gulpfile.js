/* eslint-disable */
import gulp from 'gulp';
import ifPlugin from 'gulp-if';

// Передаем значения в глобальную переменную
global.app = {
  isBuild: process.argv.includes('--build'),
  isDev: !process.argv.includes('--build'),
  gulp: gulp,
  if: ifPlugin
};

import sourcemap from 'gulp-sourcemaps';
import server from 'browser-sync';
import rename from 'gulp-rename';
import del from 'del';
import cached from 'gulp-cached';
import newer from 'gulp-newer';
import plumber from 'gulp-plumber';

import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass);
import postcss from 'gulp-postcss';
import csso from 'gulp-csso';
import autoprefixer from 'autoprefixer';

// import posthtml from 'posthtml';
import htmlmin from 'gulp-htmlmin';
import pug from 'gulp-pug';
import include from 'gulp-file-include';
import beautify from 'gulp-beautify';
import { htmlValidator } from 'gulp-w3c-html-validator';

import svgstore from 'gulp-svgstore';
import { otfToTtf, ttfToWoff, fontStyle } from "./gulptasks/fonts.js";
import { zip } from "./gulptasks/zip.js";

const fonts = gulp.series(otfToTtf, ttfToWoff, fontStyle);

import webpack from 'webpack-stream';

import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';

const clean = () => {
  return del('build');
};

const refresh = (done) => {
  server.reload();
  done();
};

const serverInit = () => {
  server.init({
    server: {
      baseDir: 'build/',
    },
    notify: false,
    port: 3000,
  })

  // gulp.watch('source/pug/**/*.pug', gulp.series(pugToHtml, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(css));
  gulp.watch('source/img/icons/*.svg', gulp.series(copySvg, sprite, html, refresh));
  gulp.watch('source/**/*.html', gulp.series(html, refresh));
  gulp.watch('source/js/**/*.js', gulp.series(js, refresh));
};

const css = () => {
  return gulp.src('source/sass/style.scss')
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream())
};

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      removeComments: true
    }))
    .pipe(include({
      prefix: '@@'
      // basepath: '@file'
    }))
    .pipe(plumber())
    // .pipe(htmlValidator.analyzer())
    // .pipe(htmlValidator.reporter())
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(gulp.dest('build'))
};

const pugToHtml = () => {
  return gulp.src('source/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(htmlValidator.analyzer())
    .pipe(htmlValidator.reporter())
    .pipe(cached('pug'))
    .pipe(gulp.dest('build'));
};

const sprite = () => {
  return gulp.src('source/img/icons/**/*.svg')
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(rename('sprite_auto.svg'))
    .pipe(gulp.dest('build/img'))
};

const copySvg = () => {
  return gulp.src('source/img/**/*.svg', { base: 'source' })
    .pipe(gulp.dest('build'));
};

const svgo = () => {
  return gulp.src('source/img/**/*.{svg}')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { removeRasterImages: true },
          { removeUselessStrokeAndFill: false },
        ]
      }),
    ]))
    .pipe(gulp.dest('source/img'));
};

const images = () => {
  return gulp.src('source/img/**/*.{jpg,jpeg,png,gif,webp}')
    .pipe(newer('build/img'))
    .pipe(webp({ quality: 75 }))
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.src('source/img/**/*.{jpg,jpeg,png,gif,webp}'))
    .pipe(newer('build/img'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 4 // 0 to 7
    }))
    .pipe(gulp.dest('build/img'))
    .pipe(gulp.src('source/img/**/*.svg'))
    .pipe(gulp.dest('build/img'))
    .pipe(server.stream())
};

const copy = () => {
  return gulp.src([
    "source/**/*.ico",
    'source/fonts/**',
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));

};

const js = () => {
  return gulp.src('source/js/main.js', { sourcemaps: app.isDev })
    .pipe(webpack({
      mode: app.isBuild ? 'production' : 'development',
      output: { filename: 'main.min.js' }
    }))
    .pipe(gulp.dest('build/js'))
    .pipe(gulp.src('source/js/main.js'))
    .pipe(gulp.dest('build/js'))
};

const mainTasks = gulp.series(sprite, gulp.parallel(copy, html, css, js, images));
const dev = gulp.series(clean, mainTasks, serverInit);
const build = gulp.series(clean, mainTasks);

export { pugToHtml }
export { sprite }
export { images }
export { zip }
export { fonts }
export { html }
// Выполнение сценария по умолчанию
gulp.task('default', dev)

