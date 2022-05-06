// fonts
import gulp from 'gulp';
import del from 'del';
import fs from 'fs';
import fonter from 'gulp-fonter-unx';
import ttf2woff2 from 'gulp-ttf2woff2';

export const otfToTtf = () => {
  return gulp.src('source/fonts/*.otf', {})
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(gulp.dest(`source/fonts/`))
};

export const ttfToWoff = () => {
  // Ищем файлы шрифтов .ttf
  return gulp.src('source/fonts/*.ttf', {})
    // Конвертируем в .woff
    .pipe(fonter({
      formats: ['woff']
    }))
    .pipe(gulp.dest('source/fonts/'))
    .pipe(gulp.src('source/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(gulp.dest('source/fonts/'))
};

export const fontStyle = () => {
  // Файл стилей подключения шрифтов
  let fontsFile = `source/sass/fonts.scss`;
  // Проверяем существуют ли файлы шрифтов
  fs.readdir('source/fonts/', function (err, fontsFiles) {
    if (fontsFiles) {
      // Проверяем существует ли файл стилей для подключения шрифтов
      if (!fs.existsSync(fontsFile)) {
        // Если файла нет, создаем его
        fs.writeFile(fontsFile, '', cb);
        let newFileOnly;
        for (var i = 0; i < fontsFiles.length; i++) {
          // Записываем подключения шрифтов в файл стилей
          let fontFileName = fontsFiles[i].split('.')[0];
          if (newFileOnly !== fontFileName) {
            let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
            let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;

            if (fontWeight.toLowerCase() === 'thin') {
              fontWeight = 100;
            } else if (fontWeight.toLowerCase() === 'extralight') {
              fontWeight = 200;
            } else if (fontWeight.toLowerCase() === 'light') {
              fontWeight = 300;
            } else if (fontWeight.toLowerCase() === 'medium') {
              fontWeight = 500;
            } else if (fontWeight.toLowerCase() === 'semibold') {
              fontWeight = 600;
            } else if (fontWeight.toLowerCase() === 'bold') {
              fontWeight = 700;
            } else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'heavy') {
              fontWeight = 800;
            } else if (fontWeight.toLowerCase() === 'black') {
              fontWeight = 900;
            } else {
              fontWeight = 400;
            }

            fs.appendFile(fontsFile,
              `@font-face {
                font-family: ${fontName};
                font-display: swap;
                src: url("../fonts/${fontFileName}.woff2") format("woff2"),
                    url("../fonts/${fontFileName}.woff") format("woff");
                font-weight: ${fontWeight};
                font-style: normal;
              }\r\n`, cb);
            newFileOnly = fontFileName;
          }
        }
      } else {
        // Если файл есть нужно его удалить
        console.log('Файл sass/fonts.scss уже существует. Для обновления файла нужно его удалить!');
      }
    }
  });

  return gulp.src('./source');
  function cb() { }
};

export const copyFontsWoff = () => {
  return gulp.src([
    "source/fonts/*.{woff,woff2}"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
};

// const fonts = gulp.series(copyFontsWoff, otfToTtf, ttfToWoff, fontStyle);
