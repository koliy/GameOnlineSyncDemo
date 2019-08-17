using System.Collections;
using System.Collections.Generic;
using PureMVC.Interfaces;
using UnityEngine;

public class GameCommand : PureMVC.Patterns.SimpleCommand , PureMVC.Interfaces.ICommand
{
    public override void Execute(INotification notification)
    {
        GameProxy _proxy = (GameProxy)this.Facade.RetrieveProxy(GameProxy.NAME);
        GameMediator _mediator = (GameMediator)this.Facade.RetrieveMediator(GameMediator.NAME);

        switch (notification.Name)
        {
            case GameNotify.OpenPlayerDialog:
                {
                    Player entity = (Player)notification.Body;
                    Debug.Log(entity);
                    break;
                }

            case GameNotify.OpenWait:
                {
                    _mediator.ShowWaitUI(true);
                    break;
                }
            case GameNotify.CloseWait:
                {
                    _mediator.ShowWaitUI(false);
                    break;
                }
            case GameNotify.OpenTalk:
                {
                    TalkData[] entity = (TalkData[])notification.Body;
                    _proxy.SetTalkDatas(entity);
                    _mediator.ShowTalkUI(true);
                    _mediator.InitTalkUI(_proxy.GetTalkData());
                    break;
                }
            case GameNotify.TalkClick:
                {
                    bool isend = _proxy.IsTalkEnd();
                    if (isend)
                    {
                        _mediator.ShowTalkUI(false);
                        if (_proxy.IsTalkChangeArea()) //场景切换
                        {
                            TalkData talkData = _proxy.GetTalkData(1);
                            NpcHandler.Inst.ChangeArea(talkData.target);
                        }
                    }
                    else
                    {
                        _mediator.InitTalkUI(_proxy.GetTalkData());
                    }
                    break;
                }
            case GameNotify.LoadChageArea:
                {
                    _mediator.LoadChageArea();
                    break;
                }
        }
    }
}
