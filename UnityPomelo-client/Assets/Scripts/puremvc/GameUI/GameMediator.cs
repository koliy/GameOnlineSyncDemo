using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PureMVC.Interfaces;
using PureMVC.Patterns;
using UnityEngine.SceneManagement;
using SimpleJson;
using UnityEngine.Events;

public class GameMediator : Mediator
{
    public new static string NAME = "GameMediator";
    public GameMediator():base(NAME)
    {

    }
    GameUI view;
    JsonObject data;
    private void RegisterCMD()
    {
        //this.Facade.RegisterCommand("", null);
        this.Facade.RegisterCommand(GameNotify.OpenPlayerDialog, typeof(GameCommand));
        this.Facade.RegisterCommand(GameNotify.OpenWait, typeof(GameCommand));
        this.Facade.RegisterCommand(GameNotify.CloseWait, typeof(GameCommand));
        this.Facade.RegisterCommand(GameNotify.OpenTalk, typeof(GameCommand));
        this.Facade.RegisterCommand(GameNotify.TalkClick, typeof(GameCommand));
        this.Facade.RegisterCommand(GameNotify.LoadChageArea, typeof(GameCommand));
        
    }

    private void RemoveCMD()
    {
        this.Facade.RemoveCommand(GameNotify.LoadChageArea);
        this.Facade.RemoveCommand(GameNotify.TalkClick);
        this.Facade.RemoveCommand(GameNotify.OpenTalk); 
        this.Facade.RemoveCommand(GameNotify.OpenPlayerDialog);
        this.Facade.RemoveCommand(GameNotify.OpenWait);
        this.Facade.RemoveCommand(GameNotify.CloseWait);
    }


    public void ShowUI(JsonObject data)
    {
        this.data = data;
        SceneManager.LoadScene("Game", LoadSceneMode.Single);
        SceneManager.sceneLoaded += onLoadingComplete;

    }
    private void onLoadingComplete(Scene scene, LoadSceneMode mode)
    {
        SceneManager.sceneLoaded -= onLoadingComplete;

        App.Inst.Init(data);

        InitUI();
        InitButton();
        RegisterCMD();
    }



    public void CloseUI()
    {
        OnDestroy();
        RemoveCMD();
    }

    private void OnDestroy()
    {
        this.view = null;
    }

    private void InitUI()
    {
        if (this.view != null) return;
        GameObject can = GameObject.Find("Canvas");
        GameObject prefab = Resources.Load<GameObject>("ui/GameUI");
        GameObject obj = Canvas.Instantiate<GameObject>(prefab, can.transform,false);
        obj.transform.localPosition = Vector3.zero;
        this.view = obj.GetComponent<GameUI>();
        this.view.InitUI();
    }
    private void InitButton()
    {
        if (this.view == null) return;
        this.view.InitButton("btnOk",()=> { this.Facade.SendNotification(GameNotify.TalkClick); });
    }
    public void ShowWaitUI(bool isshow)
    {
        if (this.view != null) this.view.ShowWaitUI(isshow);
    }

    public void ShowTalkUI(bool isshow)
    {
        if (this.view != null) this.view.ShowTalkUI(isshow);
    }
    public void InitTalkUI(TalkData data)
    {
        if (this.view != null) this.view.InitTalkUI(data);
    }

    public void LoadChageArea()
    {
        if (this.view != null) this.view.LoadResoucrce();
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
                GameNotify.Open,
            };
        }
    }


    public override void HandleNotification(INotification notification)
    {
        switch (notification.Name)
        {
            case GameNotify.Open:
                {
                    JsonObject data = (JsonObject)notification.Body;
                    ShowUI(data);
                    break;
                }
        }
    }
}
