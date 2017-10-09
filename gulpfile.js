const gulp = require('gulp');
// 压缩js模块
const uglify = require('gulp-uglify');
// 编译scss文件
const sass = require("gulp-ruby-sass"); //编译sass
// 即使刷新
const connect = require('gulp-connect');

var webserver = require('gulp-webserver');

const autoprefixer = require('gulp-autoprefixer');

// 即时刷新
gulp.task('refreshHTML',function(){
    gulp.src('./*.html').pipe(connect.reload());
    console.log('刷新页面啦')
})
//处理CSS任务
gulp.task("refreshCSS", function(){
	gulp.src("./css/*.css").pipe(connect.reload());
	console.log('css更新啦')
})
// 任务compileSass 编译scss文件
gulp.task('compileSass',function(){
	sass('./scss/*.scss',{
        style: 'expanded'
    })
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('./css'))
    console.log('编译sass啦')
})

gulp.task('webserver',function(){
    gulp.src('./')
    .pipe(
        webserver({
            host: '10.9.164.148',
            // host:'192.168.0.103',
            port :8000,
            livereload :true,
            directoryListing: {
                enabel:true,
                path:'./'
            }
        })
    )
})
// 监听函数 只要有变动 执行任务watch 就会自动执行js任务
gulp.task('watch',function(){
	// console.log('启动服务器')
	//  connect.server({
	//  	livereload:true
	//  });
	// console.log(('启动成功'))
	//检测文件的变化，执行相应的任务
    gulp.watch('./scss/*.scss',['compileSass']);
	gulp.watch('./css/*.css',['refreshCSS']);
	gulp.watch('./*.html', ['refreshHTML']);
    
})

gulp.task('default',['watch','webserver'],function(){
    console.log('done');
})
// desktop/learning/third/HTML5-CSS3/audio