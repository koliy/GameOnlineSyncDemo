using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PureMVC.Interfaces;
using PureMVC.Patterns;
using UnityEngine.SceneManagement;
using System;
using SimpleJson;

public class LoadingMediator : Mediator
{
    public new static string NAME = "LoadingMediator";
    public LoadingMediator():base(NAME)
    {

    }

    private LoadingUI view;
    private bool jsonLoad;//重新更新json配置文件的数据

    private void RegisterCMD()
    {
        //this.Facade.RegisterCommand("", null);
    }

    private void RemoveCMD()
    {
        this.Facade.RemoveCommand("");
    }


    public void ShowUI(bool jsonload)
    {
        view = GameObject.FindObjectOfType<LoadingUI>();
        view.InitUI();
        this.jsonLoad = jsonload;
        LoadAreaResource();
    }

    public void LoadAreaResource()
    {
        PomeloSocket.Inst.Request("area.resourceHandler.loadAreaResource", (data) => {
            Debug.Log("LoadAreaResource:"+data.ToString());
            SimpleJSON.JSONNode jsondata = SimpleJSON.JSON.Parse(data.ToString());
            SimpleJSON.JSONArray players = jsondata["players"].AsArray;
            SimpleJSON.JSONArray mobs = jsondata["mobs"].AsArray;
            SimpleJSON.JSONArray npcs = jsondata["npcs"].AsArray;
            SimpleJSON.JSONArray items = jsondata["items"].AsArray;
            SimpleJSON.JSONArray equipments = jsondata["equipments"].AsArray;

            view.SetTotalCount(1+1 + ( players.Count + mobs.Count) * 16 + npcs.Count + items.Count + equipments.Count);

            LoadJsonResource(()=>
            {
                //预加载所有资源到内存一遍
                view.SetLoadedCount(1);
                view.LoadMap(data["mapName"].ToString());
                view.LoadCharacter(players, "player");
                view.LoadCharacter(mobs, "mob");
                view.LoadNpc(npcs);
                view.LoadItem(items);
                view.LoadEquipment(equipments);
                view.InitObjectPools(mobs, "mob");
                view.InitObjectPools(players, "player");

                Resources.UnloadUnusedAssets();
                System.GC.Collect();

                EnterScene();
            });
        });
    }


    public void LoadJsonResource(Action action)
    {
        //是否需要更新本地json数据
        if (this.jsonLoad == false)
        {
            if (action != null)
            {
                vp_Timer.In(0.05f, ()=> { action.Invoke(); }); 
            }
            return;
        }

        string version = DataApi.Inst.GetVersion();
        JsonObject msg = new JsonObject();
        msg["version"] = version;
        PomeloSocket.Inst.Request("area.resourceHandler.loadResource", msg, (result) =>
        {
           // Debug.Log(result["data"]);
           // Debug.Log(result["version"]);

            DataApi.Inst.SetData((JsonObject)result["data"]);
            DataApi.Inst.SetVersion((JsonObject)result["version"]);
            this.jsonLoad = false;

            if (action != null) action.Invoke();

        });
    }

    public void EnterScene()
    {

        PomeloSocket.Inst.Request("area.playerHandler.enterScene", (data) => {
            //先切换到游戏场景，然后再初始化场景数据：区域，地图，人物等
            AppFacade.Instance.SendNotification(GameNotify.Open,data);
        });

    }

    public void CloseUI()
    {
        OnDestroy();
        RemoveCMD();
    }

    private void OnDestroy()
    {

    }

    /// <summary>
    /// List the <c>INotification</c> names this <c>Mediator</c> is interested in being notified of
    /// </summary>
    /// <returns>The list of <c>INotification</c> names </returns>
    public override List<string> ListNotificationInterests
    {
        get {
           
            return new List<string>()
            {
                LoadingNotify.Open,
            };
        }
    }


    public override void HandleNotification(INotification notification)
    {
        switch (notification.Name)
        {
            case LoadingNotify.Open:
                {
                    bool jsonload = (bool)notification.Body;
                    ShowUI(jsonload);
                    break;
                }
        }
    }


}
