const { src, dest, watch, parallel, series } = require('gulp');


const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');
const zip = require('@vscode/gulp-vinyl-zip').zip;


function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream());
}

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}


function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
        .pipe(newer('app/images'))
        .pipe(avif({ quality: 50 }))

        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(webp())

        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(imagemin())

        .pipe(dest('app/images'))
}

function sprite() {
    return src(['app/images/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images'))
}

function scripts() {
    return src([
        // 'node_modules/slick-carousel/slick/slick.js',
        // 'node_modules/fullpage.js/dist/fullpage.js',
        // 'node_modules/fullpage.js/vendors/easings.js',
        // 'node_modules/swiper/swiper-bundle.js',
        'app/js/main.js',
        'app/js/*.js',
        '!app/js/main.min.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}


function styles() {
    return src('app/scss/style.scss')
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function modulesCss() {
    return src([
        // 'node_modules/normalize.css/normalize.css',
        // 'node_modules/slick-carousel/slick/slick.css',
        // 'node_modules/fullpage.js/dist/fullpage.css',
        'app/css/*.css',
        '!app/css/style.min.css'
    ])
        .pipe(concat('_libs.scss'))
        .pipe(dest('app/scss'))
        .pipe(browserSync.stream());
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/*.scss'], styles)
    watch(['app/css/*.css', '!app/css/style.min.css'], modulesCss)
    watch(['app/images/src'], images)
    watch(['app/fonts/src'], fonts)
    watch(['app/js/main.js', 'app/js/*.js', '!app/js/main.min.js'], scripts)
    watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/*.html']).on('change', browserSync.reload)
}


// ! Creating a distribution for the client ===start===
function dist() {
    return src('.')
        .pipe(dest('dist'));
}

function cleanDist() {
    return src('dist')
        .pipe(clean());
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/images/*.*',
        // '!app/images/*.svg',
        // 'app/images/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'));
}

function erasureDist() {
    return src(['dist/components/',
        'dist/pages/index.html'], { read: false })
        .pipe(clean());
}

function erasureDistAll() {
    return src(['dist/components/',
        'dist/pages/'], { read: false })
        .pipe(clean());
}

// ! Creating a distribution for the client ===end===


// ! Deleting images from a folder ===start===
function resetImg() {
    return src(['app/images/*.*'], { read: false })
        .pipe(clean())
}
// ! Deleting images from a folder ===end===


// ! Archivator ===Start===

function arch(){
    return src('dist/**/*')
    .pipe(zip('dist.zip'))
    .pipe(dest('dist'));
}

// ! Archivator ===end===

exports.dist = dist;
exports.styles = styles;
exports.modulesCss = modulesCss;
exports.images = images;
exports.fonts = fonts;
exports.building = building;
exports.pages = pages;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;
exports.resetImg = resetImg;
exports.arch = arch;


exports.build = series(dist, cleanDist, building, erasureDist);
exports.buildOnePage = series(dist, cleanDist, building, erasureDistAll);
exports.default = parallel(modulesCss, styles, images, fonts, scripts, pages, watching);



// ! gulp - старт галпу
// ! gulp build - створення багатосторінкового дистрибутиву для клієнта
// ! gulp buildOnePage - створення односторінкового дистрибутиву для клієнта
// ! gulp resetImg - видалення малюнків з "images" для їх перезапису
// ! gulp arch - створення архіву дистрибутиву в течці dist
