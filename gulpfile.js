const gulp = require("gulp");

const serve = require("./gulp/tasks/serve");
const pug2html = require("./gulp/tasks/pug2html");
const styles = require("./gulp/tasks/styles");
const script = require("./gulp/tasks/script");
const fonts = require("./gulp/tasks/fonts");
const imageMinify = require("./gulp/tasks/imageMinify");
const clean = require("./gulp/tasks/clean");
const lighthouse = require("./gulp/tasks/lighthouse");
const svgSprite = require("./gulp/tasks/svgSprite");
const seo = require("./gulp/tasks/seo");
const favicons = require("./gulp/tasks/favicons");
// const copyDependencies = require("./gulp/tasks/copyDependencies");

const dev = gulp.parallel(
  pug2html,
  styles,
  script,
  fonts,
  imageMinify,
  svgSprite,
  seo,
  favicons
);

// const build = gulp.series(clean, copyDependencies, dev);
const build = gulp.series(clean, dev);

module.exports.start = gulp.series(build, serve);
module.exports.build = build;

module.exports.lighthouse = gulp.series(lighthouse);
