using System.Collections;
using System.Collections.Generic;
using PureMVC.Interfaces;
using UnityEngine;

public class BootstrapViewMediators : PureMVC.Patterns.SimpleCommand, PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        this.Facade.RegisterMediator(new LoginMediator());
        this.Facade.RegisterMediator(new LoadingMediator());
        this.Facade.RegisterMediator(new GameMediator());
    }
}
