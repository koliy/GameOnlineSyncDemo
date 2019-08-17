using System.Collections;
using System.Collections.Generic;
using PureMVC.Interfaces;
using UnityEngine;

public class LoadingCommand : PureMVC.Patterns.SimpleCommand , PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        LoadingMediator _mediator = (LoadingMediator)this.Facade.RetrieveMediator(LoadingMediator.NAME);

        switch (notification.Name)
        {
            case "":
                {
                    break;
                }
        }
    }
}
