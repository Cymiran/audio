var _audio = {
    // 变量
    audio : null,
    canvas : null,
    ctx : null,
    ctxCircle : null,
    durtime : 0,
    onoff1 : true,
    offsetleft : 0,
    loudPro : null,
    t : null,
    time : 0,
    arrmusics : [],
    $index : 0,
    lyric : [],
    can : {cans:this.onoff1},

    // 菜单选歌
    selectMusic : function(){
        $('#select').click(function(){
            $('ul#menu').toggle()
        })
        this.selectSong()
    },
    // 选歌
    selectSong : function(){
        let that = this;
        $('ul#menu').on('click','li',function(){
            that.$index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active')
            that.changeMusic(that.$index,'1')
            setTimeout(function() {
                $('ul#menu').hide()
            }, 200);
        })
    },
    // 暂停与播放
    pauseAndPlay : function(){
        // 暂停
        let that = this;
        $('#play').click(function(){
            if(!that.audio.paused){
                that.pausemusic()
            }else{
                that.playmusic()
            }
        })
        // 播放
        $('#bofang').click(function(){
            if(!that.audio.paused){
                that.pausemusic()
            }else{
                that.playmusic()
            }
        })
    },
    // 播放
    playmusic :function (){
        this.audio.play();
        $('.play-btn').removeClass('icon-bofang1');
        $('.play-btn').addClass('icon-pause');

        $('#bofang').addClass('none');
        $('#bofang').removeClass('block');
        // 头像旋转
        $('.headimg').addClass("turnaround")
        this.makePro()
    },
    // 暂停
    pausemusic :function (){
        this.audio.pause();
        $('.play-btn').removeClass('icon-pause');
        $('.play-btn').addClass('icon-bofang1');
        
        $('#bofang').removeClass('none');
        $('#bofang').addClass('block');

        $('.headimg').removeClass("turnaround")
    },
    // 绘制进度条
    makePro :function (){
        let that = this;
        let h = $('.progress').height()/2;
        let percent = 0;
        let timer = setInterval(function(){
            percent = that.audio.currentTime/that.audio.duration;
            if(!that.audio.paused && percent != 1){
                that.run(that.canvas,that.ctx,h,percent);
                that.pro(that.canvas,that.ctx,h,percent)
            }
            if(percent == 1 ){
                that.$index++;
                if (that.$index>that.arrmusics.length-1) that.$index=0;
                that.changeMusic(that.$index,'1')
            }
        }, 20);
    },
    // 进度条
    proMove : function(){
        //进度移动
        let that = this;
        $('#canvas')[0].addEventListener('touchstart',function(e){
            let evt = e||event; 
            $('#canvas')[0].addEventListener('touchmove',function(evt){
                // 判断点是否在圆上
                let ev = evt || event;
                console.log(ev)
                let evtn = ev.changedTouches[0]
                let x = evtn.clientX;  
                let y = evtn.clientY;
                console.log(that.ctx.isPointInPath(x,y))
                if(that.ctx.isPointInPath(x,y)){  
                    //路径正确，鼠标移动事件  
                    console.log('移动了') 
                };
            })
        })
    },
    // 音量
    louder : function (){
        let that = this;
        $('.loud').click(function(){
            if(that.onoff1){
                $('.yinliang').hide()
                that.onoff1 = false;
                
            }else{
                that.onoff1 = true;
                $('.yinliang').show()
                that.offsetleft = $('.loud-hand').offset().left;
            }
            that.can.cans=that.onoff1
        })
    },
    // 音量设置
    setLoud : function(){
        let that = this;
        draggable($('.loud-hand')[0], {
            x:true, y:false, limit: true, 
            callback : function(section, distance){ 
                if((distance.x-that.offsetleft)/that.loudPro < 0){
                    that.audio.volume = 0
                }else{

                    if((distance.x-that.offsetleft)/that.loudPro > 1){
                        that.audio.volume = 1
                    }else{
                        that.audio.volume = (distance.x-that.offsetleft)/that.loudPro;
                    }
                }
            }
        },that.can);
    },

    //上一首
    preSong : function(){
        let that = this;
        $("#pre").click(function() {
            that.$index--;
            if (that.$index<0) that.$index=that.arrmusics.length-1;
            that.changeMusic(that.$index,'1')
        });
    },
    //下一首
    nextSong : function(){
        let that = this;
        $("#next").click(function() {
            that.$index++;
            if (that.$index>that.arrmusics.length-1) that.$index=0;
            that.changeMusic(that.$index,'1')
        })
    },
    //随机播放键
    randomSong : function(){
        let that = this;
        $('.suiji').click(function(event) {
            that.$index=Math.floor(Math.random()*that.arrmusics.length);
            that.changeMusic(that.$index,'1')
        })
    },
    // 喜欢
    heartSong : function(){
        $('.heart').click(function(){
            $(this).find('.liked').addClass('like')
        })
    },
    // 获得歌曲
    getMusic :function (){
        let that = this;
        $.ajax({
            type:'get',
            url: '../musicInfo.json',
            success: function(res){
                console.log(res)
                that.arrmusics = res.data;
                that.$index = that.arrmusics.length-1;

                that.musicMenu()
                that.changeMusic(that.$index,'0')
                that.pausemusic()
            }
        })
    },
    // 歌曲菜单
    musicMenu :function (){
        let str = ''
        for(let i = 0;i<this.arrmusics.length;i++){
            str += `
            <li>
                <span class="music">${this.arrmusics[i].song}</span>
                <span class="geshou">${this.arrmusics[i].singer}</span>
            </li>
            `
        }
        $('ul#menu').html(str)
    },
    // 切歌
    changeMusic :function (index,type){
        this.audio.src=this.arrmusics[index].src;
        $(".head").text(this.arrmusics[index].song);
        $('.name').text(this.arrmusics[index].singer);
        $("img#head").attr("src", this.arrmusics[index].headimg); 
        let that = this;
        // 歌词
        $.get(that.arrmusics[index].lyric, function(lrc) {
            lyric = that.parseLyric(lrc);
            that.loadLyric(lyric);
       });
       if(type == '0'){
            that.pausemusic()
       }else{
            that.audio.load()
            that.playmusic()
       }
    },

    // 加载歌词
    loadLyric : function (lyric) {
        $('.lyc-box').html('')
        var lyricContent = $('.lyc-box');
        _.each(lyric, function(content, index, $){
            lyricContent.append('<p name="lyric" id=' + index + '>' + content[1] + '</p>');
        });
    },
    // 歌词更新
    getLyric :function (lyric){
        for(let i=0;i<lyric.length;i++){
            if (this.audio.currentTime > lyric[i][0] - 1) {
                $('p[name=lyric]').css('color', '#fff'); 
                $('p#'+i).css('color', 'rgb(255, 254, 28)');

                let boxheight = $('.main-two').height()
                let pheight = $('.lyc-box p:first-child').height()
                $('.lyc-box').css('top',boxheight - pheight * (i + 2) + 'px');
            };
        }
    },

    // 手柄转动
    run :function (canvas,cxt,h,percent){
        cxt.clearRect(0,0,canvas.width,canvas.height);  
        this.makeCircle()
        
        cxt.save();//将当前以左上角坐标为(0,0)的上下文环境进行保存，这样是为了在接下来中要进行画布偏移后，可以进行还原当前的环境
        cxt.translate(canvas.width/2,canvas.height/2);
        cxt.rotate(percent*Math.PI*2);//设定每次旋转的度数
        cxt.fillStyle='#fff';
        cxt.beginPath();
        cxt.arc(0,-h,5,0,2*Math.PI,false);
        cxt.closePath();

        cxt.fill();
        cxt.restore();//将当前为(500,400)的点还原为（0,0）,其实在save中就是将上下文环境保存到栈中，在restore下面对其进行还原
    },
    // 进度条
    pro :function (canvas,cxt,h,percent){
        // cxt.translate(canvas.width/2,canvas.height/2);
        cxt.beginPath();
        cxt.lineWidth=2;
        cxt.strokeStyle="#fff";
        cxt.arc(canvas.width/2,canvas.height/2,h+1,-90 * Math.PI / 180,  percent*Math.PI *2-90 * Math.PI / 180,false);
        cxt.stroke();
    },

    // 格式化歌词
    parseLyric : function (lyric) {
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
    },

     // 格式化时间
     formateTime :function (duration){
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
    },
    // 进度条圆环
    makeCircle : function(){
        let h = $('.progress').height()/2;
        this.ctx.save()
        this.ctx.beginPath();
        this.ctx.lineWidth=2;
        this.ctx.strokeStyle="#6f6f6f";
        this.ctx.arc(canvas.width/2,canvas.height/2,h+1,-90 * Math.PI / 180,  Math.PI *2,false);
        this.ctx.stroke();
    },
    init : function(){
        this.audio = document.getElementById('audios');
        this.canvas = document.getElementById('canvas');
        
        this.ctx = canvas.getContext('2d');
        this.canvas.height=$('.main-one').height();
        this.canvas.width=$('.main-one').width();

        $('.yinliang').hide()
        this.audio.volume=0.5;
        this.loudPro = $('.loud-pro').width()

        
        this.getMusic()
        this.selectMusic()
        this.pauseAndPlay()
        this.proMove()
        this.louder()
        this.setLoud()
        this.preSong()
        this.nextSong()
        this.randomSong()
        this.heartSong()
        this.makeCircle()

        let that = this;
        that.audio.addEventListener("canplay",function(){
            that.durtime = Math.ceil(that.audio.duration);
            // 时间
            $('.time').html(that.formateTime(that.durtime))
        })

        that.audio.addEventListener("timeupdate",function(){
            let ct=that.audio.currentTime
            let dt=that.audio.duration
            $('.time').html(that.formateTime(dt-ct))
            $(".progress").css({
                transform:"rotate("+(ct*360/dt)+"deg)"
            })
            setTimeout(function(){
                that.getLyric(lyric)
            },0)
            
            
        })
    }

}

window.onload = _audio.init()