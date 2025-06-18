module.exports = function(grunt) {
  // プラグインをロード
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // 設定
  grunt.initConfig({
    jshint: {
      // 対象ファイルを指定
      all: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        // .jshintrc を利用
        jshintrc: true
      }
    }
  });

  // デフォルトタスクなどを登録
  grunt.registerTask('default', ['jshint']);
};
