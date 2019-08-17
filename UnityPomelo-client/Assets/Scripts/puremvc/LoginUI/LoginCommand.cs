using System.Collections;
using System.Collections.Generic;
using PureMVC.Interfaces;
using UnityEngine;

public class LoginCommand : PureMVC.Patterns.SimpleCommand , PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        LoginProxy _proxy = (LoginProxy)this.Facade.RetrieveProxy(LoginProxy.NAME);
        LoginMediator _mediator = (LoginMediator)this.Facade.RetrieveMediator(LoginMediator.NAME);

        switch (notification.Name)
        {
            case LoginNotify.ShowRole:
                {
                    _mediator.ShowRoleUI();
                    break;
                }
        }
    }
}
