using Pomelo.DotNetClient;
using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PomeloSocket : MonoBehaviour
{
    public static PomeloSocket Inst;

    private PomeloClient pclient;

    // Start is called before the first frame update
    void Awake()
    {
        DontDestroyOnLoad(this.gameObject);
        Inst = this;
    }

    private void OnApplicationQuit()
    {
        Debug.Log("OnApplicationQuit");
        this.Disconnect();
    }
    // Update is called once per frame
    void Update()
    {
        if (pclient != null) pclient.update();
    }

    public PomeloSocket InitClient(string host, int port,Action<JsonObject> cb)
    {
        Disconnect();
        pclient = new PomeloClient();
        pclient.NetWorkStateChangedEvent += (state) =>
        {
            Debug.Log(state);
        };
        pclient.initClient(host, port, () =>
        {
            Connect(cb);
        });
       
        pclient.on("websocket-error", (data) =>
        {
            Debug.LogError(data);
        });
        return this;
    }

    public void Connect(Action<JsonObject> cb)
    {
        if(pclient != null ) pclient.connect(null, cb);
    }

    public void Request(string route,JsonObject data,Action<JsonObject> cb)
    {
        if (pclient != null)
        {
            pclient.request(route, data, cb);
        }
    }

    public void Request(string route, Action<JsonObject> cb)
    {
        if (pclient != null)
        {
            pclient.request(route,cb);
        }
    }

    public void Notify(string route, JsonObject msg)
    {
        if (pclient != null)
        {
            pclient.notify(route, msg);
        }
       
    }

    public void Disconnect()
    {
        if (pclient != null) pclient.disconnect();
        pclient = null;

    }

    public void On(string msg,Action<JsonObject> cb)
    {
        pclient.on(msg, cb);
    }

}
