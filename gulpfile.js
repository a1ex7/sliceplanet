var gulp           = require('gulp'),
    gutil          = require('gulp-util' ),
    sass           = require('gulp-sass'),
    browserSync    = require('browser-sync'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    cleanCSS       = require('gulp-clean-css'),
    rename         = require('gulp-rename'),
    del            = require('del'),
    imagemin       = require('gulp-imagemin'),
    svgSprite      = require('gulp-svg-sprite'),
    googleWebFonts = require('gulp-google-webfonts');
    cache          = require('gulp-cache'),
    autoprefixer   = require('gulp-autoprefixer'),
    notify         = require('gulp-notify'),
    sourcemaps     = require('gulp-sourcemaps'),
    pug            = require('gulp-pug'),
    fileinclude    = require('gulp-file-include'),
    combineMq      = require('gulp-combine-mq');


/* Tasks */


/* Html with includes */

gulp.task('html', function() {
  return gulp.src(['src/html/**/*.html', '!src/html/**/_*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(gulp.dest('src'));
});



/* Pug Views Compile*/

gulp.task('pug', function() {
  return gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
    .pipe(pug({
      pretty: true
    })).on('error', notify.onError())
    .pipe(gulp.dest('src'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Compress common scripts */

gulp.task('common-js', function() {
  return gulp.src([
      'src/js/custom.js',
      // other scripts
    ])
    .pipe(concat('custom.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/js'));
});



/* Concatenate Libs scripts and common scripts */

gulp.task('js', ['common-js'], function() {
  return gulp.src([

      'src/js/jquery-3.0.0.min.js',
      'src/js/jquery-migrate-1.4.1.min.js',
      'src/js/components/slick.js',
      // other lib scripts

      'src/js/custom.min.js',
    ])
    .pipe(concat('scripts.min.js'))
    // .pipe(uglify())   // optional, if lib scripts not minimized
    .pipe(gulp.dest('src/js'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Magic with sass files */

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError()))
    .pipe(autoprefixer(['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']))
    .pipe(gulp.dest('src/css'))
    // .pipe(combineMq()) // Grouping media queries (!)incompatible with soursemap
    .pipe(cleanCSS()) // Optional, remove unused style rules (!)danger
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Browser Sync Server */

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: true,
    // tunnel: true,
    // tunnel: 'projectmane', //Demonstration page: http://projectmane.localtunnel.me
  });
});



/* Monitoring */

gulp.task('watch', ['pug', 'sass', 'js', 'browser-sync'], function() {
  //gulp.watch('src/html/**/*.html', ['html']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch(['src/libs/**/*.js', 'src/js/**/*.js'], ['js']);
  gulp.watch('src/*.html', browserSync.reload);
});



/* Image optimization */

gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false,
          removeUselessStrokeAndFill: true,
        }]
      }),
    ]))
    .pipe(gulp.dest('dist/img'));
});


/* Generate SVG Sprites */

gulp.task('sprites', function() {
  return gulp.src('src/img/svg/**/*.svg')
    .pipe(svgSprite({
      log: 'info',
      shape: {
        spacing: {
          padding: 0
        }
      },
      mode: {

        view: {
          dest: 'sass',
          dimensions: true,
          bust: false,
          layout: 'diagonal',
          sprite: '../img/sprites/sprite.svg',
          render: {
            scss: {
              dest: '_sprite.scss',
              template: 'src/img/sprites/tmpl/sprite.scss'
            }
          },
          example: {
            dest: '../img/sprites/sprite.html'
          }
        },

        symbol: {
          dest: 'sass',
          bust: false,
          sprite: '../img/sprites/sprite-symbol.svg',
          prefix: '.symbol-%s',
          inline: true,
          render: {
            scss: {
              dest: '_sprite-symbol.scss',
            }
          },
          example: {
            dest: '../img/sprites/sprite-symbol.html'
          }
        }
      }
    }))
    .pipe(gulp.dest('src'));
});



/* Download Google Fonts */

var options = {
  fontsDir: '../fonts/',
  cssDir: '../sass/',
  cssFilename: 'webfonts.css'
};

gulp.task('fonts', function() {
  return gulp.src('src/fonts/fonts.list')
    .pipe(googleWebFonts(options))
    .pipe(gulp.dest('src/fonts'));
});


/* Build project */

gulp.task('build', ['removedist', 'imagemin', 'pug', 'sass', 'js'], function() {

  var buildHtml = gulp.src([
    'src/*.html',
  ]).pipe(gulp.dest('dist'));

  var buildCss = gulp.src([
    'src/css/*.min.css',
  ]).pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src([
    'src/js/scripts.min.js',
  ]).pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src([
    'src/fonts/**/*',
  ]).pipe(gulp.dest('dist/fonts'));

});



/* Helpers */

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });


/* Go! */

gulp.task('default', ['watch']);
