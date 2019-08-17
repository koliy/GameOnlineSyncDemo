using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using PureMVC.Interfaces;
using PureMVC.Patterns;


public class LoginMediator : Mediator,IMediator
{
    public new static string NAME = "LoginMediator";
    public LoginMediator():base(NAME)
    {
      
    }

    private LoginUI view;
    private LoginProxy proxy;

    private void RegisterCMD()
    {
        this.Facade.RegisterCommand(LoginNotify.ShowRole, typeof(LoginCommand));
    }

    private void RemoveCMD()
    {
        this.Facade.RemoveCommand(LoginNotify.ShowRole);
    }


    public void ShowUI()
    {
        GameObject obj = MonoBehaviour.Instantiate(Resources.Load("LoginPanel", typeof(GameObject)),Vector3.zero,new Quaternion(0,0,0,0),GameObject.Find("Canvas").transform) as GameObject;
        obj.transform.localScale = Vector3.one;
        obj.transform.localPosition = Vector3.zero;
        
        view = obj.GetComponent<LoginUI>();
        RegisterCMD();
    }

    public void ShowRoleUI()
    {
        view.ShowRoleUI();
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
                LoginNotify.Open,
            };
        }
    }


    public override void HandleNotification(INotification notification)
    {
        switch (notification.Name)
        {
            case LoginNotify.Open:
                {
                    ShowUI();
                    break;
                }
        }
    }
}
