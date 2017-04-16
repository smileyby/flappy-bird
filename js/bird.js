/*
 * author : yi-jy
 * 屏幕高度 screenH
 * 底部空白  70
 * 柱子中间空隙高度  120
 * 柱子和底部直接的绿色斜线层高度 24
 * 顶部柱子和底部柱子总高度为 screenH - 70 - 120 - 24
 */

(function(){
  var d = document,
    game = $$(".game"),
    obstacle = $$(".obstacle"),
    bird = $$(".bird"),
    startBtn = $$(".start-game"),
    resetBtn = $$(".reset-game"),
    quitBtn = $$(".quit-game"),
    gameStartLayer = $$(".game-start"),
    gameOverLayer = $$(".game-over"),
    nowScore = $$(".now-score"),
    highestScore = $$(".highest-score"),
    counter = $$(".counter"),
    audio = $$("audio"),
    pillar = d.querySelectorAll(".pillar"),
    bAddEvent = false,
    iCounter = 3,
    transform = detectCssSupport("webkitTransform") ? "webkitTransform" : "transform";

  var gamePillar = {
    create : function(){
      var screenH = d.documentElement.clientHeight || d.body.clientHeight,
        screenW = d.documentElement.clientWidth || d.body.clientWidth,
        obstacleH = screenH - 70, // 障碍层总高度
        pillarAllH = obstacleH - 24 , // 障碍柱子总高度
        pillarOtherH = pillarAllH - 120; // 障碍柱子顶部和底部的总高度
      game.style.height =  obstacleH +"px";
      obstacle.style.height = obstacleH+"px";
      obstacle.style.width = screenW + "px";
      return {
        pillarAllH : pillarAllH,
        pillarOtherH : pillarOtherH
      }
    },
    // 游戏开始重新生成柱子
    restart : function(){
      for(var i=0;i<3;i++){
        transformChange(pillar[i] , 320 + i*180 , 0 , 0);
        pillar[i].style.height = this.create().pillarAllH + "px";
        this.render(pillar[i]);
      }
    },
    // 刷新最后一个柱子
    render : function(ele){
      var tempPillarT = ele.querySelector(".pillar-t"),
        tempPillarB = ele.querySelector(".pillar-b"),
        pillarTopH = 0,
        pillarBottomH = 0;
      pillarTopH = parseInt(this.create().pillarOtherH*Math.random()) + 1;
      if(pillarTopH<50){
        pillarTopH = 50;
      }
      else if(pillarTopH> this.create().pillarOtherH-50){
        pillarTopH = this.create().pillarOtherH - 50;
      }
      pillarBottomH = this.create().pillarOtherH - pillarTopH;
      ele.setAttribute("minTop",pillarTopH);
      ele.setAttribute("maxTop",pillarTopH+120);
      tempPillarT.style.height = pillarTopH + "px";
      tempPillarB.style.height = pillarBottomH + "px";
    },
    moveTimer : null
  }

  var  gameBird = {
    iTargetTop : 0,
    iTargetBottom : function(){
      return gamePillar.create().pillarAllH - 190 - 24;
    },
    bDown : true,
    bFly : false,
    fly : function(){
      var t = this;
      if(!t.bFly){
        return ;
      }
      t.bDown = false;
      bird.className = "bird bird-fly";
      // audio.setAttribute("src","music/fly.mp3");
      // audio.play();
      t.iTargetTop = transformVal(bird,1) - 60;
      move(bird,t.iTargetTop,20,function(){
        move(bird,t.iTargetBottom(),50);
      });
    }
  }

  var gameScene = {
    startCounterTimer : null,
    cuntdownTimer : null,
    start : function(){
      var t = this;
      gameStartLayer.className = "game-status-layer game-start game-status-layer-slideup";
      t.startCounterTimer = setTimeout(function(){
        counter.style.display = "block";
        if(!t.cuntdownTimer){
          t.cuntdownTimer = setInterval(function(){
            counter.innerHTML = --iCounter;
            if(iCounter == 0){
              clearInterval(t.cuntdownTimer);
              t.cuntdownTimer = null;
              gameScene.playing();
            }
          },500)
        }
        t.startCounterTimer = null;
      },500);
    },
    playing : function(){
      move(bird,gameBird.iTargetBottom(),50);
      gameBird.bFly = true;
      (!gamePillar.MoveTimer) && (gamePillar.MoveTimer = setInterval(detectPosition,10));
      if(bAddEvent)return; // 避免重复绑定
      d.addEventListener(("ontouchstart" in window)? "touchstart" : "mousedown",function(){
        bAddEvent = true;
        gameBird.fly();
      },false);
    },
    over : function(){
      clearInterval(gamePillar.MoveTimer);
      gamePillar.MoveTimer = null;
      gameBird.bFly = false;
      counter.style.display = "none";
      gameOverLayer.className = "game-status-layer game-over game-status-layer-slidedown";
      nowScore.innerHTML = iCounter;
      if(localStorage){ // 存储分数
        if(localStorage["bestScore"] || localStorage["bestScore"] == 0){
          highestScore.innerHTML = localStorage["bestScore"];
          if(iCounter>localStorage["bestScore"]){
            localStorage["bestScore"] = iCounter;
          }
        }
        else{
          highestScore.innerHTML = localStorage["bestScore"] = 0;
        }
      }
    },
    restart : function(){
      gameOverLayer.className = "game-status-layer game-over game-status-layer-slideup";
      gameStartLayer.className = "game-status-layer game-start game-status-layer-slidedown";
      bird.className = "bird bird-fly";
      counter.innerHTML = iCounter = 3;
      transformChange(bird , 0 , 0 , 0);
      gamePillar.restart();
    },
    quit : function(){
      if(!("ontouchstart" in window)){
        confirm("是否退出游戏？") && window.close();
      }
      else{
        alert("请手动关闭页面！");
      }
    }
  }

  function detectPosition(){
    var birdTempTop = transformVal(bird,1) + 190;
    (birdTempTop == gameBird.iTargetBottom() + 190) && gameScene.over();
    for(var i=0;i<3;i++){
      var pillarTempLeft = transformVal(pillar[i],0);
      if(pillarTempLeft == -50){ // 新生成柱子
        transformChange(pillar[i] , 490 , 0 , 0);
        gamePillar.render(pillar[i]);
      }
      if(pillarTempLeft>=10 && pillarTempLeft<90){
        var tempMaxTop = pillar[i].getAttribute("maxTop"),
          tempMinTop = pillar[i].getAttribute("minTop");
        if(birdTempTop > tempMaxTop){
          transformChange(bird , 0 , tempMaxTop-190 , 0);
          gameScene.over();
        }
        else if(birdTempTop < tempMinTop){
          transformChange(bird , 0 , tempMinTop-190 , 0);
          gameScene.over();
        }
        if(pillarTempLeft == 10){  // 得分加 1
          counter.innerHTML = ++iCounter;
          // audio.setAttribute("src","music/pass.mp3");
          // audio.play();
        }
      }
      transformChange(pillar[i] , transformVal(pillar[i],0)-1, 0 ,0);
    }
  }

  function move(ele,iTarget,d,fn){
    var Tween = {
      /*
       * t 初始时间
       * b 初始位置 ele.offsetTop
       * c 差值  iTarget - b
       * d 周期  defined self
       */
      Linear: function(t,b,c,d){ return c*t/d + b; },
      Quad: {
         easeIn: function(t,b,c,d){
         return c*(t/=d)*t + b;
         },
         easeOut: function(t,b,c,d){
         return -c *(t/=d)*(t-2) + b;
         },
         easeInOut: function(t,b,c,d){
         if ((t/=d/2) < 1) return c/2*t*t + b;
         return -c/2 * ((--t)*(t-2) - 1) + b;
         }
      }
    }
    var t=0,
      b = transformVal(ele,1) || 0,
      c = iTarget - b;
    clearTimeout(move.t);
    function run(){
      if(t<d){
        t++;
        if(gameBird.bDown){
          transformChange(ele , 0 , Math.ceil(Tween.Quad.easeIn(t,b,c,d)) , 0);
        }
        else{
          transformChange(ele , 0 , Math.ceil(Tween.Quad.easeOut(t,b,c,d)) , 0);
        }
        move.t = setTimeout(run, 10);
      }
      else{
        transformChange(ele , 0 , b+c , 0);
        if(gameBird.bDown){
            ele.className = "bird bird-died";
            // audio.setAttribute("src","music/drop.mp3");
            // audio.play();
        }
        gameBird.bDown = true;
        if(fn){
          fn();
        }
        }
    }
    run();
  }

  function detectCssSupport (prop) {
    var div = document.createElement('div'),
          vendors = 'Khtml Ms O Moz Webkit'.split(' '),
          len = vendors.length;

      if ( prop in div.style ) return true;
      prop = prop.replace(/^[a-z]/, function(val) {
          return val.toUpperCase();
      });
      while(len--) {
        if ( vendors[len] + prop in div.style ) {
            return true;
        }
      }
      return false;
  }

  function transformChange(ele , targetX , targetY , targetZ){
    ele.style["webkitTransform"] = "translate3d(" + targetX + "px," + targetY + "px," + targetZ + "px)";
    ele.style["transform"] = "translate3d(" + targetX + "px," + targetY + "px," + targetZ + "px)";
  }

  function transformVal(ele , index){
    return Number(ele.style[transform].replace(/translate3d|\(|\)|px/g,"").split(",")[index]);
  }

  function $$(str){
    return d.querySelector(str);
  }

  gamePillar.create();
  gamePillar.restart();

  startBtn.addEventListener("click",gameScene.start,false);

  resetBtn.addEventListener("click",gameScene.restart,false);

  quitBtn.addEventListener("click",gameScene.quit,false);

})()




