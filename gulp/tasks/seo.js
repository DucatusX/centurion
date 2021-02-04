const gulp = require("gulp");

module.exports = function fonts() {
  return gulp.src("src/seo/**/*").pipe(gulp.dest("build/"));
};
