module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      buildGame: {
        options: {
          sourceMap: true,
          sourceMapName: 'bin/Pxl.js.map',
          // The following two options fix issues when debugging with sourcemaps (turn off for final build)
          mangle: false,
          compress: {sequences: false, join_vars: false}
        },
        files: {
          'bin/Pxl.min.js': [
            // note, all files are specified for dependency management
            'src/core/Game.js',
            'src/core/Beacon.js',
            'src/core/Point.js',
            'src/core/Rectangle.js',
            'src/core/Timer.js',
            'src/core/Tween.js',
            'src/entity/Entity.js',
            'src/entity/EntityFactory.js',
            'src/entity/component/Component.js',
            'src/entity/component/DataCom.js',
            'src/entity/component/KillOffscreen.js',
            'src/entity/component/PhysicsComponent.js',
            'src/entity/component/PixelBlotMap.js',
            'src/entity/component/DisplayCom.js',
            'src/entity/component/SpriteCom.js',
            'src/entity/component/TextCom.js',
            'src/entity/component/PointerCom.js',
            'src/entity/component/GridPlacerCom.js',
            'src/entity/component/AudioCom.js',
            'src/scene/Scene.js',
            'src/scene/SceneDirector.js',
            'src/scene/system/System.js',
            'src/scene/system/Canvas2dDisplaySys.js',
            'src/scene/system/KeyboardInput.js',
            'src/scene/system/PointerSys.js',
            'src/scene/system/Physics.js',
            'src/scene/system/PixelBlotRenderer.js',
            'src/scene/system/GridPlacerSys.js',
            'src/scene/system/AudioSys.js',
            'src/core/Utils.js',
            'src/core/Preloader.js',
            'src/core/SpriteStore.js',
            'src/core/AudioStore.js',
            'src/core/SaveData.js',
          ]
        }
      }
    },
    watch: {
      scripts: {
        files: [
          'src/**/*.js',
        ],
        tasks: ['uglify'],
        options: {
          spawn: false,
        },
      },
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['uglify', 'watch']);
};
