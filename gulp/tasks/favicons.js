const gulp = require("gulp");

module.exports = function fonts() {
  return gulp.src("src/favicons/**/*").pipe(gulp.dest("build/favicons"));
};
