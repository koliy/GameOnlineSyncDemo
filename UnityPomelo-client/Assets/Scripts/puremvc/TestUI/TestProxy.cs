using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestProxy : PureMVC.Patterns.Proxy ,PureMVC.Interfaces.IProxy
{
    public new static string NAME = "LoginProxy";
    public TestProxy() : base(NAME)
    {
    }


    public void InitData()
    {

    }
}
