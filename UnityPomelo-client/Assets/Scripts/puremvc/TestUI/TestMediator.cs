using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PureMVC.Interfaces;
using PureMVC.Patterns;


public class TestMediator : Mediator
{
    public new static string NAME = "LoginMediator";
    public TestMediator():base(NAME)
    {

    }


    private void RegisterCMD()
    {
        //this.Facade.RegisterCommand("", null);
    }

    private void RemoveCMD()
    {
        this.Facade.RemoveCommand("");
    }


    public void ShowUI()
    {

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
                TestNotify.Open,
            };
        }
    }


    public override void HandleNotification(INotification notification)
    {
        switch (notification.Name)
        {
            case TestNotify.Open:
                {
                    break;
                }
        }
    }
}
