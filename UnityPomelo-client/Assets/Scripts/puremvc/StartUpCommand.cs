using PureMVC.Interfaces;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class StartUpCommand : PureMVC.Patterns.MacroCommand,PureMVC.Interfaces.ICommand
{
   


    protected override void InitializeMacroCommand()
    {
        base.InitializeMacroCommand();
        this.AddSubCommand(typeof(BootstrapViewMediators));
        this.AddSubCommand(typeof(BootstrapCommand));
        this.AddSubCommand(typeof(BootstrapModels));
    }



    public void Execute(INotification notification)
    {
        base.Execute(notification);
    
        switch (notification.Name)
        {
            case AppFacade.STARTUP:
                {
                    Debug.Log("Init AppFacade Start...");
                    this.SendNotification(LoginNotify.Open);
                    break;
                }
        }

    }


}

