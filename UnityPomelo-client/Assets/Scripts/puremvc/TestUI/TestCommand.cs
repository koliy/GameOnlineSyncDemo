using System.Collections;
using System.Collections.Generic;
using PureMVC.Interfaces;
using UnityEngine;

public class TestCommand : PureMVC.Patterns.SimpleCommand , PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        TestProxy _proxy = (TestProxy)this.Facade.RetrieveProxy(TestProxy.NAME);
        TestMediator _mediator = (TestMediator)this.Facade.RetrieveMediator(TestMediator.NAME);

        switch (notification.Name)
        {
            case "":
                {
                    break;
                }
        }
    }
}
