用js开发flappy bird
==================

相信很多手机玩家都玩过flappy bird，这是一款一夜爆红的游戏，也是2014年最热门的手游。近段时间我也玩了起来，于是决定用js模拟一个。虽然在移动端做出的页面性能不及原生app，但这款js版flappy bird在最新的chrome和firefox浏览器运行起来还是蛮流畅，用手机页面测试也能跑的起来，我也一直在尝试着优化。

## 小鸟

当你仔细观察这款游戏时，会发现游戏中的小鸟是在原地（X轴方向）不动的，只是在上下（Y轴方向）飞翔。开始游戏后，小鸟默认是做类似自由落体运动，只有当你点击屏幕时，小鸟才向上运动，当到达最高点时然后再做自由落体运动。此处小鸟所涉及的运动，我才用著名tween.js动画库，点击屏幕向上采用easeOut减速，到达最高点时，我自定义一个回调函数，这个回调函数是用于自由炉体，即向下时采用easeIn加速。这里列出所有用到的teeen.js代码：

```js

var Tween = {
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

```

至于屏幕的点击事件，不用说你也知道需要在document上绑定一个onclick，只不过对于移动端的300ms延迟，这里我们就直接同ontouchstart兼容下吧。

## 柱子

这个游戏除了鸟，最重要的部分就是障碍柱子了。在屏幕可视范围内，我们最多可以看到2个柱子。于是我们在游戏初始时生成3根柱子，其中每根柱子
又由顶部柱子，中间缝隙，底部柱子三部分组成。在我们知道每根柱子总高度(pillarAllH)和中间的空隙高度(pillarGap)时，我们就可以得到柱子的剩余高度(pillarOtherH)：

```js

pillarOtherH = pillarAllH - pillarGap;

```

然后继续对剩余高度pillarOther进行随机得到顶部柱子的高度（pillarTopH）:

```js

pillarTopH = parseInt(pillarOtherH*Math.random()) + 1;

```

最后得到底部柱子的高度（pillarBottomH）：

```js

pillarBottomH = pillarOtherH - pillarTopH;

```

并把pillarTopH 和 pillarBottomH记录到柱子上，这里我给每个柱子设置minTop和maxTop属性，而属性值分别是pillarTopH 和 (pillarBottomH + pillarGap)。

当游戏开始时，开启定时器，柱子开始负X轴方向运动，此时我们使用css3中translateX进行递减。当某根柱子移除左边界时，我们需要对这个珠子进行特殊处理，即将这个珠子的translateX的值设置为：第二根珠子translateX+本身宽度+珠子空隙间的宽度。由于珠子的运动都是循环，因此此时为一固定值。

## 游戏场景

每个游戏的场景都离不开这么几个场景，开始，游戏中、游戏介绍。然后就是游戏复位。

**开始**：在游戏中，我设置了一个开始按钮，点击开始那妞便进入3秒倒计时，然后进入游戏中...

**游戏中**：开启柱子运动的定时器，点击屏幕控制小鸟上下运动。此阶段最重要的就是碰撞检测，当然我们不是无时无刻在检测碰撞，我们在游戏中会观察到，只有在小鸟穿过柱子时，小鸟能够碰到柱子。于是，我们就得到这样一个坐标范围：

*	坐标的起点：小鸟的left-柱子的宽度
*	坐标的终点：小鸟的left+小鸟的宽度

然后我们便可在这个坐标范围内获取小鸟的translateY，再去与柱子的minTop和maxTop去做判断。如果未碰撞，则分数加1.如果碰撞，则游戏结束...

**结束**：关闭柱子运动定时器，记录分数。对于存储分数，我们使用的是本地存储，首先判断是否存在这款游戏的分数记录，如果没有，则将分数记录为0，如果有分数记录，则判断本地游戏所得分是否高于这个分数记录，如果高于分数记录，则用本次游戏得分覆分数记录，反之，则不作任何操作。

**复位**：即将本次游戏的分数清0，重新倒计时开始游戏

## 游戏优化

原本计划是希望更改left去改变柱子的左移，更改top值去控制小鸟的上下飞翔。但是后来想到要改变DOM的left和top值，就需要读取柱子和小鸟的offsetLeft和offsetTop，这是一个既耗时，又耗性能（读取和设置DOM）的操作，于是果断开启GPU的3d加速，然后跑起来的效果明显流畅多了。



[试玩Demo](https://smileyby.github.io/flappy-bird/)














