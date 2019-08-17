using SimpleJson;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
namespace model
{
    public class Animation
    {
        protected string kindId;
        protected string types;
        protected string name;
        public Animation(string kindId,string types,string name)
        {
            this.kindId = kindId;
            this.types = types;
            this.name = name;
        }

        public virtual GameObject create()
        {
            GameObject _prefab = Resources.Load<GameObject>(types+"/"+ kindId);
            GameObject obj = (GameObject)MonoBehaviour.Instantiate(_prefab);
            return obj;
        }

        public JsonObject getJsonData()
        {
            JsonObject data = new JsonObject();
            data["height"] = 100;
            return data;
        }

    }
}

