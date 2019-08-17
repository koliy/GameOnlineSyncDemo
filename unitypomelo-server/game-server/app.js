var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');
var routeUtil = require('./app/util/routeUtil');
var scene = require('./app/domain/area/scene');
var dataApi = require('./app/util/dataApi');
var playerFilter = require('./app/servers/area/filter/playerFilter');
var areaService = require('./app/domain/area/areaService');


/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'unitypomelo');

//配置全局环境
app.configure('production|development',function(){
    app.set('proxyConfig',{
        cacheMsg:true,
        interval:30,
        lazyConnection:true
    });
    
    app.set('remoteConfig',{
        cacheMsg:true,
        interval:30
    });
    
    if(app.serverType !== 'master'){
        var areas = app.get('servers').area; //{"id": "area-server-1", "host": "127.0.0.1", "port": 3250, "area": 1}
        var areaIdMap = {};
        for(var id in areas){
            areaIdMap[areas[id].area] = areas[id].id;
        }
        
        app.set('areaIdMap',areaIdMap);
    }
    
    app.route('area',routeUtil.area);//area路由访问选择
    app.route('connector',routeUtil.connector);
    app.loadConfig('mysql',app.getBase()+'/../shared/config/mysql.json');
});

//配置数据库
app.configure('production|development','area|auth|connector|master',function(){
    var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient',dbclient);
    //db数据与内存数据间的定时同步
    app.use(sync,{sync:{path:__dirname+'/app/dao/mapping',dbclient:dbclient}});
});

// 配置connector服务器
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 30,
      heartbeats:false,
      useDict : true,
      useProtobuf : true
    });
});
//配置gate服务器
app.configure('production|development','gate',function(){
    app.set('connectorConfig',
        {
            connector:pomelo.connectors.hybridconnector,
            useProtobuf:true
        });
});

//配置auth服务器
app.configure('production|development','auth',function(){
    app.set('session',require('./config/session.json'));
});

//配置场景服务器
app.configure('production|development','area',function(){
    app.filter(pomelo.filters.serial());//添加命令串行过滤器，会把每一条handler处理放入sequeue队列中顺序执行。
    app.before(playerFilter());
	
	//单个area服务器
	//检查是副本服务器还是场景服务器
    var server = app.curServer;
    if(server.instance){
    
    }else{
        ////{"id": "area-server-1", "host": "127.0.0.1", "port": 3250, "area": 1},服务进程执行这
        scene.init(dataApi.area.findById(server.area)); ////初始化area.json的数据，地图，npc，装备等 //["1","desert",1,"沙漠",0,4200,2800,"/config/map/desert.json",300,300],
        app.areaManager = scene;
    }
    
    //初始化全部area服务器的基本数据,用于当前area切换下一个area功能
    areaService.init();
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
