var gulp=require('gulp');
var uglify=require('gulp-uglify');

gulp.task('uglify', function(){
    var srcBase='staticSrc/js/';
    var dstBase='staticFile/static/js/';
    var jsFile=[
        {
            src: 'test/test.js',
            dst: 'test/'
        },
    ];

    for(let i=0; i<jsFile.length; i=i+1){
        let src=srcBase+jsFile[i].src;
        let dst=dstBase+jsFile[i].dst;
        gulp.src(src)
            .pipe(uglify())
            .pipe(gulp.dest(dst));
    }

})
