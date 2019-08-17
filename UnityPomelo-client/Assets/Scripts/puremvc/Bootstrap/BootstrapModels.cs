using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using PureMVC.Interfaces;

public class BootstrapModels : PureMVC.Patterns.SimpleCommand, PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        this.Facade.RegisterProxy(new LoginProxy());
        this.Facade.RegisterProxy(new GameProxy());
    }
}
