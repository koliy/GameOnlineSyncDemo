using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class App
{
    private static App _inst;
    public static App Inst
    {
        get
        {
            if (_inst == null) _inst = new App();
            return _inst;
        }
    }
    private bool inited = false;
    public Area area = null;
    private ObjectPoolManager poolManager = null;
    public CursorServer cursorServer = null;

    /// <summary>
    /// 服务端到客户端的响应延迟时间
    /// </summary>
    private float delayTime = 0;

    public void Init(JsonObject data)
    {
       // Debug.Log(data.ToString());
        object mapdata;
        bool isok = data.TryGetValue("map", out mapdata);
        if (isok)
        {
            JsonObject _mapdata = mapdata as JsonObject;
            DataManager.Inst.mapdata.Clear();
            DataManager.Inst.mapdata.name = _mapdata["name"].ToString();
            DataManager.Inst.mapdata.width = Convert.ToInt32(_mapdata["width"]);
            DataManager.Inst.mapdata.height = Convert.ToInt32(_mapdata["height"]);
            DataManager.Inst.mapdata.tileW = Convert.ToInt32(_mapdata["tileW"]);
            DataManager.Inst.mapdata.tileH = Convert.ToInt32(_mapdata["tileH"]);

            Debug.Log("Enter Game Area Name: "+DataManager.Inst.mapdata.name);

            SimpleJSON.JSONNode jsondata = SimpleJSON.JSON.Parse(_mapdata["weightMap"].ToString());
            SimpleJSON.JSONArray weightmap = jsondata.AsArray; 
            for(int i = 0; i < weightmap.Count; i++)
            {
                SimpleJSON.JSONArray collisions = weightmap[i]["collisions"].AsArray;

                WeightMapData _data = new WeightMapData(i, collisions.Count);
                for(int j = 0; j < collisions.Count; j++)
                {
                    CollisionData _col = new CollisionData();
                    _col.start = collisions[j]["start"].AsInt;
                    _col.length = collisions[j]["length"].AsInt;
                    _data.Add(j,_col);
                }
                DataManager.Inst.mapdata.weightMap.Add(_data);
            }

        }
        Debug.Log("curPlayer Data:"+data["curPlayer"].ToString());
        DataManager.Inst.pomelodata.playerjsondata = data["curPlayer"] as JsonObject;
        DataManager.Inst.playerdata = JsonUtility.FromJson<PlayerData>(DataManager.Inst.pomelodata.playerjsondata.ToString());//DataManager.Inst.InitPlayerData(DataManager.Inst.pomelodata.playerjsondata);


        this.area = new Area(data, DataManager.Inst.mapdata);
 
        cursorServer = new CursorServer();
        cursorServer.OnMouseExit();
    }



    public Player getCurPlayer()
    {
        return (Player)getArea().getCurPlayer();
    }
    public Area getArea()
    {
        return area;
    }

    public float getDelayTime()
    {
        return delayTime;
    }
    public void setDelayTime(float time)
    {
        delayTime = time;
    }

    public ObjectPoolManager getObjectPoolManage()
    {
        if (poolManager == null) poolManager = ObjectPoolManager.Inst;
        return poolManager;
    }
}
