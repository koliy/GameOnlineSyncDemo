using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;

public class DataManager
{
    private static DataManager _inst;
    public static DataManager Inst
    {
        get {
            if (_inst == null) _inst = new DataManager();
            return _inst;
        }
    }

    public MapData mapdata;
    public PomeloData pomelodata;
    public PlayerData playerdata;

    public DataManager()
    {
        pomelodata = new PomeloData();
        mapdata = new MapData();
        playerdata = new PlayerData();
    }

    public PlayerData InitPlayerData(JsonObject data)
    {
        PlayerData playerdata = null;
        if (data != null)
        {
            playerdata = new PlayerData();
            Type t = playerdata.GetType();

            ICollection<string> keys = data.Keys;
            foreach (string key in keys)
            {
                PropertyInfo info = t.GetProperty(key);
                if (info == null) continue;

                string _t = info.PropertyType.Name;
                if (_t == "String")
                {
                    info.SetValue(playerdata, data[key].ToString());
                }
                else if (_t == "Int32")
                {
                    info.SetValue(playerdata, Convert.ToInt32(data[key]));
                }
                else if (_t == "Int64")
                {
                    info.SetValue(playerdata, Convert.ToInt64(data[key]));
                }

               // Debug.Log(_t+":"+ info.GetValue(playerdata));
            }
        }
        return playerdata;
    }

}
