using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Area 
{
    public GameObject scene;

    private int playerId;
    public Map map;
    private bool isStopped = false;
    private ComponentAdder componentAdder;
    public ActionManager actionManager;
    private Dictionary<int, int> players;
    private Dictionary<int, Entity> entities;

    public Area(JsonObject opts, MapData mapdata)
    {
        playerId = DataManager.Inst.playerdata.id;
        isStopped = false;
         
        players = new Dictionary<int, int>();
        entities = new Dictionary<int, Entity>();
        actionManager = new ActionManager();
        componentAdder = new ComponentAdder(this);

        init(opts, mapdata);
    }

    public void init(JsonObject opts, MapData mapdata)
    {
        Debug.Log("<color=#00ff00> >>>>>>>>>>>>>>>>>>>> Area Init Start >>>>>>>>>>>>>>>>>>>>></color>");
        //根据设备分辨率，修改对应的aoi范围
        initColorBox();
        //创建背景地图
        map = new Map(mapdata, this.scene, Vector2.zero);
        Debug.Log("<color=#00ff00> [[[ Map Init end ]]]</color>");
        //添加当前玩家
        addEntity(DataManager.Inst.playerdata);
        //添加其他对象：玩家，npc，mob
        //Debug.Log("add other entities:"+opts["entities"].ToString());
        JsonObject entities = (JsonObject)opts["entities"];
        addOtherEntity(entities);

        //设置坐标
        var pos = this.getCurPlayer().getSprite().getPosition();
        this.map.centerTo(pos);
        //重新修正AOI灯塔范围
        var width = Utils.ScreenWidth;
        var height = Utils.ScreenHeight;
        JsonObject msg = new JsonObject();
        msg["width"] = width;
        msg["height"] = height;

        //根据屏幕的大小，重新修改角色的可视范围大小
        //PomeloSocket.Inst.Notify("area.playerHandler.changeView", msg);
        PomeloSocket.Inst.Request("area.playerHandler.changeView", msg, (_data) =>
        {
            Debug.LogFormat("<color=#00ff00> >>>> screewidth: {0},screenheight: {1},changeViewData: {2} <<<< </color>", Utils.ScreenWidth, Utils.ScreenHeight, _data);
            if (_data.ContainsKey("range"))
            {
                DataManager.Inst.playerdata.range = Convert.ToInt32(_data["range"]);
                CurPlayer e = (CurPlayer)this.getCurPlayer();
                e.range = DataManager.Inst.playerdata.range;
            }

        });
        //添加当前玩家点击移动组件
        this.componentAdder.addComponent();

        Debug.Log("<color=#00ff00><<<<<<<<<<<<<<<<<<<< Area Init End  <<<<<<<<<<<<<<<<<<<< </color>");
    }
    private void initColorBox()
    {
        this.scene = new GameObject("Scene");
        this.scene.transform.position = new Vector3(0, 0, 10f);
        this.scene.AddComponent<SceneServer>();

    }
    /// <summary>
    /// 添加所有aoi区域的对象：玩家，mob，npc
    /// </summary>
    /// <param name="data"></param>
    public void addOtherEntity(JsonObject data)
    {
       // Debug.Log(data.ToString());
        SimpleJSON.JSONNode jsondata = SimpleJSON.JSON.Parse(data.ToString().Trim()); 
        ICollection<string> keys = data.Keys;
        foreach (string key in keys)
        {
            SimpleJSON.JSONArray array = jsondata[key].AsArray;
            if (array == null || array.Count == 0) continue;
            Debug.LogFormat("<color=#1395E7> add other entity >>>>>> {0} </color>", key);
            Consts.EntityType type = EnumChange<Consts.EntityType>.StringToEnum(key);
            for (int i = 0; i < array.Count; i++)
            {
                var _data = array[i];
                if (getEntity(_data["entityId"].AsInt) != null)
                {
                    Debug.LogFormat("<color=#FDB53B> Warining :add exist entity id:{0}</color>", _data["entityId"].AsInt);
                    continue;
                }

                JsonObject configdata = null;
                if(type == Consts.EntityType.player|| type == Consts.EntityType.mob)
                {
                    configdata = DataApi.Inst.character.FindById(_data["kindId"].AsInt);
                    buildEntity(configdata, ref _data);
                    _data.Add("type", key);
                    Debug.Log(_data.ToString());
                    PlayerData entitydata = JsonUtility.FromJson<PlayerData>(_data.ToString());
                    //addEntity(entitydata);

                    this.actionManager.addAction(new AddEntityAction(entitydata));
                }
                else if(type == Consts.EntityType.npc)
                {
                    configdata = DataApi.Inst.npc.FindById(_data["kindId"].AsInt);
                    buildEntity(configdata, ref _data);
                    _data.Add("type", key);
                    Debug.Log(_data.ToString());
                    EntityData entitydata = JsonUtility.FromJson<EntityData>(_data.ToString());
                    //addEntity(entitydata);

                    this.actionManager.addAction(new AddEntityAction(entitydata));

                }else if(type == Consts.EntityType.item)
                {
                    configdata = DataApi.Inst.item.FindById(_data["kindId"].AsInt);
                    buildEntity(configdata, ref _data);
                    _data.Add("type", key);
                    Debug.Log(_data.ToString());
                    ItemData entitydata = JsonUtility.FromJson<ItemData>(_data.ToString());
                    //addEntity(entitydata);

                    this.actionManager.addAction(new AddEntityAction(entitydata));
                }
                else
                {
                    configdata = DataApi.Inst.equipment.FindById(_data["kindId"].AsInt);
                    buildEntity(configdata, ref _data);
                    _data.Add("type", key);
                    Debug.Log(_data.ToString());
                    EntityData entitydata = JsonUtility.FromJson<EntityData>(_data.ToString());
                    //addEntity(entitydata);

                    this.actionManager.addAction(new AddEntityAction(entitydata));
                }
                   
            }
        }
    }

    public void buildEntity(JsonObject configdata,ref SimpleJSON.JSONNode _data)
    {

        //获取配置数据,新数据不覆盖
        ICollection<string> npcKeys = configdata.Keys;
        foreach (string _key in npcKeys)
        {
            if (string.IsNullOrEmpty(_key)) continue;
            if(_data[_key] == null) _data.Add(_key, configdata[_key].ToString());
        }
    }

    public bool addEntity(EntityData entity)
    {
        
        if (entity == null || entity.entityId <= 0) return false;
        Entity e = null;

        switch (entity.type)
        {
            case "player":
                {
                    Debug.Log("add id:" + entity.id + ",curplayer id:" + DataManager.Inst.pomelodata.playerId);
                    if(entity.id == DataManager.Inst.pomelodata.playerId) //当前玩家
                    {
                        var player = DataManager.Inst.playerdata;
                        e = new CurPlayer(player,this.scene, map) as CurPlayer;
                        this.players.Add(player.id, e.entityId);
                    }
                    else
                    { //其它玩家
                        var entitydata = (PlayerData)entity;
                        e = new Player(entitydata, this.scene, map);
                        Debug.Log("AddEntity ~ playerId :" + entitydata.id + ", teamId =" + entitydata.teamId);
                        if(!this.players.ContainsKey(entity.id)) this.players.Add(entity.id, e.entityId);
                    }
                    
                    break;
                }
            case "npc":
                {
                    e = new Npc(entity, this.scene, map);
                    break;
                }
            case "mob":
                {
                    var entitydata = (PlayerData)entity;
                    e = new Mob(entitydata, this.scene, map);
                    break;
                }
            case "item":
                {
                    var entitydata = (ItemData)entity;
                    e = new Item(entitydata, this.scene, map);
                    break;
                }
            case "equipment":
                {
                    break;
                }
            default: return false;
        }
        
        var eNode = e.getSprite().curNode.transform;
        if(eNode.parent == null)
        {
            Debug.Log("this entity curNode de father is null");
            eNode.parent = this.map.node.transform;
        }
        if(!this.entities.ContainsKey(entity.entityId)) this.entities.Add(entity.entityId, e);
        this.componentAdder.addComponentTo(e);

        return true;
    }

    public void removeEntity(int id)
    {
        if (!this.entities.ContainsKey(id)) return ;

        var e = this.entities[id];
        e.destroy();
        this.entities.Remove(id);
        
    }

    public Entity getEntity(int id)
    {
        return this.entities.ContainsKey(id) ? this.entities[id] : null;
    }

    public Entity getCurPlayer()
    {
        return this.getPlayer(this.playerId);
    }

    public Entity getPlayer(int playerid)
    {
        return this.entities[this.players[playerid]];
    }
    /// <summary>
    /// 玩家离线则清除，对象移出aoi区域不会调用此
    /// </summary>
    /// <param name="playerId"></param>
    public void removePlayer(int playerId)
    {
        if (this.players.ContainsKey(playerId))
        {
            int id = this.players[playerId];
            this.removeEntity(id);
            this.players.Remove(playerId);
        }
    }
}
