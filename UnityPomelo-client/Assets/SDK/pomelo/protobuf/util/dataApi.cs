using DG.Tweening;
using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;

public class DataApi
{
    private static DataApi _inst;
    public static DataApi Inst
    {
        get
        {
            if (_inst == null) _inst = new DataApi();
            return _inst;
        }
    }

    public class Data
    {
        public string key;
        public JsonObject data;
        public Data(string key)
        {
            this.key = key;
            this.data = null;
        }

        public void Set(JsonObject data)
        {
            this.data = data;
            vp_Timer.In(0.3f, () =>
            {
                PlayerPrefs.SetString(this.key, data.ToString());
                PlayerPrefs.Save();
            });
        }

        public JsonObject FindById(int id)
        {
            var data = this.All();
            if (!data.ContainsKey(id.ToString())) return null;
            return (JsonObject)data[id.ToString()];
        }

        public JsonObject All()
        {
            if (this.data != null) this.data = (JsonObject)SimpleJson.SimpleJson.DeserializeObject(PlayerPrefs.GetString(this.key, "{}"));
            return this.data;
        }
    }



    public string GetVersion()
    {
        return SimpleJSON.JSON.Parse(PlayerPrefs.GetString("version", "{}"));
    }

    public void SetVersion(JsonObject version)
    {
        PlayerPrefs.SetString("version", version.ToString());
    }
    private Data _fightskill;
    public Data fightskill {
        get
        {
            if (_fightskill == null) _fightskill = new Data("fightskill");
            return _fightskill;
        }
    }
    private Data _equipment;
    public Data equipment {
        get
        {
            if (_equipment == null) _equipment = new Data("equipment");
            return _equipment;
        }
    }

    private Data _item;
    public Data item {
        get
        {
            if (_item == null) _item = new Data("item");
            return _item;
        }
    }

    private Data _character;
    public Data character {
        get
        {
            if (_character == null) _character = new Data("character");
            return _character;
        }

    }

    private Data _npc;
    public Data npc {
        get
        {
            if(_npc == null) _npc = new Data("npc");
            return _npc;
        }  
    }


    public void SetData(JsonObject data)
    {

        if (data != null)
        {
            Type t = this.GetType();
            ICollection<string> keys = data.Keys;
            foreach (string key in keys)
            {
                Data d =  (Data)t.GetProperty(key).GetValue(this);
                Debug.Log("============= Config "+key+"  Data =================");
                Debug.Log(data[key]);
                d.Set((JsonObject)data[key]);
              //  Debug.Log( d.All());
            }
        }
    }


}

