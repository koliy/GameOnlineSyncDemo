# 乐观帧(非轮)

  #### 1.服务端每秒钟50次向所有客户端发送更新消息（包含所有客户端的操作和递增的帧号）
  #### 2.客户端每帧播放服务端的数据，如果没有数据，就必须等待
  #### 3.客户端就像播放游戏录像一样不停的播放这些包含每帧所有玩家操作的 update消息。
  #### 4.客户端如果一帧内接受到很多连续的数据，说明延迟或断线重连了，则快进播放。
  #### 5.客户端只有按键按下或者放开，就会发送消息给服务端（而不是到每帧开始才采集键盘），消息只包含一个整数。服务端收到以后，改写player_keyboards
  
 
## 测试：
1.需要nodejs环境

2.在项目内，执行下面命令，以便安装依赖包
``` bash
$:npm install
```
3.启动服务器
``` bash
$:node app
```
4.启动2个客户端，进入client目录下用google浏览器打开index.html。其它浏览器对socket.io兼容性不好。

## 样图:
![image](https://github.com/koliy/GameOnlineSyncDemo/blob/master/TestUnLockStep/11.png)



