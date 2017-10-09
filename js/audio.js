var _audio = {
    init : function(){
        var audio = document.getElementById('audios');

        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        canvas.height=$('.main-one').height();
        canvas.width=$('.main-one').width();

        let durtime;

        //音量开关
        let onoff1=true; 
        $('.yinliang').hide()
        audio.volume=0.5;
        let offsetleft;
        let loudPro = $('.loud-pro').width()
        var volpast;
        let t=null;
        let time=0;//定义运动的执行次数

        let arrmusics = []
        let $index = 0
        let lyricSrcs = []
        let lyric;

        getMusic()

        $(audio).prop("src",$(audio).attr("data-src"))
        audio.load()

        // 菜单选歌
        $('#select').click(function(){
            // musicMenu()
            $('ul#menu').toggle()
        })
        
        // 选歌
        $('ul#menu').on('click','li',function(){
            $index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active')
            changeMusic($index,'1')
            setTimeout(function() {
                $('ul#menu').hide()
            }, 200);
            
        })
        // 暂停
        $('#play').click(function(){
            if(!audio.paused){
                pausemusic()
            }else{
                playmusic()
            }
        })
        
        $('#bofang').click(function(){
            if(!audio.paused){
                pausemusic()
            }else{
                playmusic()
            }
        })
        
        audio.addEventListener("canplay",function(){
            durtime = Math.ceil(audio.duration);
            // 时间
            $('.time').html(formateTime(durtime))
        })

        audio.addEventListener("timeupdate",function(){
            let ct=audio.currentTime
            let dt=audio.duration
            $('.time').html(formateTime(dt-ct))
            $(".progress").css({
                transform:"rotate("+(ct*360/dt)+"deg)"
            })
            setTimeout(function(){
                getLyric(lyric)
            },0)
            
            
        })
        //进度移动
        $('#canvas').on('mouseup',function(e){
            let evt = e||event;  
            let x = evt.clientX;  
            let y = evt.clientY; 
            drag(x,y)
        })
        // 音量
        var can={cans:onoff1}
        $('.loud').click(function(){
            if(onoff1){
                $('.yinliang').hide()
                onoff1 = false;
                
            }else{
                onoff1 = true;
                $('.yinliang').show()
                offsetleft = $('.loud-hand').offset().left;
            }
            can.cans=onoff1
        })
         // 音量设置
        draggable($('.loud-hand')[0], {
            x:true, y:false, limit: true, 
            callback : function(section, distance){ 
                
                if((distance.x-offsetleft)/loudPro < 0){
                    audio.volume = 0
                }else{

                    if((distance.x-offsetleft)/loudPro > 1){
                        audio.volume = 1
                    }else{
                        audio.volume = (distance.x-offsetleft)/loudPro;
                    }
                }
            }
        },can);
        
        //上一首
        $("#pre").click(function() {
            $index--;
            if ($index<0) $index=arrmusics.length-1;
            changeMusic($index,'1')
        });
        //下一首
        $("#next").click(function() {
            $index++;
            if ($index>arrmusics.length-1) $index=0;
            changeMusic($index,'1')
        });
        //随机播放键
        $('.suiji').click(function(event) {
            $index=Math.floor(Math.random()*arrmusics.length);
            changeMusic($index,'1')
        });
        // 喜欢
        $('.heart').click(function(){
            $(this).find('.liked').addClass('like')
        })

        // 获得歌曲
        function getMusic(){
            $.ajax({
                type:'get',
                url: '../musicInfo.json',
                success: function(res){
                    console.log(res)
                    arrmusics = res.data;
                    $index = arrmusics.length-1;
                    // lyricSrcs.push(arrmusics.lyric)
                    musicMenu()
                    
                    changeMusic($index,'0')
                    pausemusic()
                }
            })
        }
        // 歌曲菜单
        function musicMenu(){
            let str = ''
            for(let i = 0;i<arrmusics.length;i++){
                str += `
                <li>
                    <span class="music">${arrmusics[i].song}</span>
                    <span class="geshou">${arrmusics[i].singer}</span>
                </li>
                `
            }
            $('ul#menu').html(str)
        }
        // 切歌
        function changeMusic(index,type){
            // 清除头像旋转
            

            audio.src=arrmusics[index].src;
            $(".head").text(arrmusics[index].song);
            $('.name').text(arrmusics[index].singer);
            $("img#head").attr("src", arrmusics[index].headimg); 
            // 歌词
            $.get(arrmusics[index].lyric, function(lrc) {
                lyric = parseLyric(lrc);
                loadLyric(lyric);
           });
           if(type == '0'){
                pausemusic()
           }else{
                audio.load()
                playmusic()
           }
            
        }
        // 加载歌词
        function loadLyric(lyric) {
            $('.lyc-box').html('')
            var lyricContent = $('.lyc-box');
            _.each(lyric, function(content, index, $){
                lyricContent.append('<p name="lyric" id=' + index + '>' + content[1] + '</p>');
            });
        }
        // 歌词更新
        function getLyric(lyric){
            for(let i=0;i<lyric.length;i++){
                if (audio.currentTime > lyric[i][0] - 1) {
                    $('p[name=lyric]').css('color', '#fff'); 
                    $('p#'+i).css('color', 'rgb(255, 254, 28)');
    
                    let boxheight = $('.main-two').height()
                    let pheight = $('.lyc-box p:first-child').height()
                    $('.lyc-box').css('top',boxheight - pheight * (i + 2) + 'px');
                };
            }
        }
        
        // 播放
        function playmusic(){
            audio.play();
            $('.play-btn').removeClass('icon-bofang1');
            $('.play-btn').addClass('icon-pause');

            $('#bofang').addClass('none');
            $('#bofang').removeClass('block');
            // 头像旋转
            $('.headimg').addClass("turnaround")
            makePro()
        }
        // 暂停
        function pausemusic(){
            audio.pause();
            $('.play-btn').removeClass('icon-pause');
            $('.play-btn').addClass('icon-bofang1');
            
            $('#bofang').removeClass('none');
            $('#bofang').addClass('block');

            $('.headimg').removeClass("turnaround")
        }
        // 绘制进度条
        function makePro(){
            let h = $('.progress').height()/2;
            let percent = 0;
            let timer = setInterval(function(){
                percent = audio.currentTime/audio.duration;
                if(!audio.paused && percent != 1){
                    
                    run(canvas,ctx,h,percent);
                    pro(canvas,ctx,h,percent)
                }
            }, 20);
        }
        // 手柄转动
        function run(canvas,cxt,h,percent){
            cxt.clearRect(0,0,canvas.width,canvas.height);   
            cxt.save();//将当前以左上角坐标为(0,0)的上下文环境进行保存，这样是为了在接下来中要进行画布偏移后，可以进行还原当前的环境
            cxt.translate(canvas.width/2,canvas.height/2);
            cxt.rotate(percent*Math.PI*2);//设定每次旋转的度数
            cxt.fillStyle='#fff';
            cxt.beginPath();
            cxt.arc(0,-h,5,0,2*Math.PI,false);
            cxt.closePath();

            cxt.fill();
            cxt.restore();//将当前为(500,400)的点还原为（0,0）,其实在save中就是将上下文环境保存到栈中，在restore下面对其进行还原
        }
        // 进度条
        function pro(canvas,cxt,h,percent){
            // cxt.translate(canvas.width/2,canvas.height/2);
            cxt.beginPath();
            cxt.lineWidth=2;
            cxt.strokeStyle="#fff";
            cxt.arc(canvas.width/2,canvas.height/2,h+1,-90 * Math.PI / 180,  percent*Math.PI *2-90 * Math.PI / 180,false);
            cxt.stroke();
        }
        
        // 拖拽手柄
        function drag(x,y){
            // 判断点是否在圆上
            if(ctx.isPointInPath(x,y)){  
                //路径正确，鼠标移动事件  
                console.log('移动了') 
            };  
        }
        // 格式化歌词
        function parseLyric(lyric) {
            var lines = lyric.split('\n'),
                pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
                result = [];
            while (!pattern.test(lines[0])) {
                lines = lines.slice(1);
            };
            lines[lines.length - 1].length === 0 && lines.pop();
            _.each(lines, function(data, step){
                var index = data.indexOf(']');
                var time = data.substring(0, index+1),
                    value = data.substring(index+1);
                var timeString = time.substring(1, time.length-2);
                var timeArr = timeString.split(':');
                result.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
    
            });
            result.sort(function(a, b) {
                return a[0] - b[0];
            });
            return result;
        }
        // 格式化时间
        function formateTime(duration){
            var theTime1 = 0;// 分
            var theTime2 = 0;// 小时
            if(duration < 60){
                if(duration < 10){
                    return "0:0"+parseInt(duration);
                }else{
                    return "0:"+parseInt(duration);
                }
            }else{
                theTime1 = parseInt(duration/60);
                duration = parseInt(duration%60);
                    if(theTime1 >= 60) {
                        theTime2 = parseInt(theTime1/60);
                        theTime1 = parseInt(theTime1%60);
                    }
                var result = ""+parseInt(duration);
                if(duration == 0){result = "00";}
                if(duration < 10){result = "0"+parseInt(duration);}
                if(theTime1 > 0) {
                    if(theTime1 < 10){
                        result = "0"+parseInt(theTime1)+":"+result;
                    }else{
                        result = ""+parseInt(theTime1)+":"+result;
                    }
                }
                else if(theTime1 == 0){
                    result = ""+"00"+":"+result;
                }
                if(theTime2 > 0) {
                    if(theTime2 < 10){
                        result = "0"+parseInt(theTime2)+":"+result;
                    }else{
                        result = ""+parseInt(theTime2)+":"+result;
                    }
                }
                return result;
            }
        }
        

    }
}
window.onload = _audio.init()