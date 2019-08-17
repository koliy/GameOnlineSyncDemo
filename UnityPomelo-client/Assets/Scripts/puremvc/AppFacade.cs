using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

public class AppFacade : PureMVC.Patterns.Facade ,PureMVC.Interfaces.IFacade
{
    private static AppFacade _instance;
    public const string STARTUP = "startup";

    public AppFacade() : base()
    {
    }

    public static AppFacade Instance
    {
        get{
            if (_instance == null) {
                _instance = new AppFacade();
            }
            return _instance;
        }
    }
    protected override void InitializeController()
    {
        base.InitializeController();
        this.RegisterCommand(AppFacade.STARTUP, new StartUpCommand());
    }


    /// <summary>
    /// 启动框架
    /// </summary>
    public void StartUp() {
        this.SendNotification(AppFacade.STARTUP);
        this.RemoveCommand(AppFacade.STARTUP);
    }
}

