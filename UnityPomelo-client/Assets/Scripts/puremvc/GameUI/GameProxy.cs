using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameProxy : PureMVC.Patterns.Proxy ,PureMVC.Interfaces.IProxy
{
    public new static string NAME = "GameProxy";
    private TalkData[] talkdatas;
    private int talkindex = 0;
    public GameProxy() : base(NAME)
    {
    }


    public void InitData()
    {

    }

    public void SetTalkDatas(TalkData[] talkdatas)
    {
        this.talkindex = 0;
        this.talkdatas = talkdatas;
    }

    public TalkData GetTalkData()
    {
        return this.talkdatas[talkindex++];
    }
    public TalkData GetTalkData(int index)
    {
        return this.talkdatas[index];
    }
    public bool IsTalkEnd()
    {
        return talkindex >= this.talkdatas.Length;
    }
    public bool IsTalkChangeArea()
    {
        return talkindex >= this.talkdatas.Length && (this.talkdatas[1].action == "changeArea");
    }
}
