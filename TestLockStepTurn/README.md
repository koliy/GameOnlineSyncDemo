# 帧锁定同步

  #### 1.服务端设置每秒钟50次向更新所有客户端发送的消息，每update为一帧，
  如果服务端没有接受完所有的客服端关键帧k1的控制数据，则等待接受完再发送同步包。
  每个关键帧只有1个接收的控制数据有效，接收到多个则覆盖最新。
  #### 2.客户端每几个关键帧播放服务端的数据，如果当前关键帧没有数据，就必须等待
  #### 3.如果当前关键帧有数据，则应用接受到的上一帧update，并发送当前帧接收到的input和控制信息给服务器
  #### 4.果当前关键帧有多个数据，则快进
  #### 5.有1个客户端延迟，则所有客户端都等待
  
 
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





