using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoginProxy : PureMVC.Patterns.Proxy ,PureMVC.Interfaces.IProxy
{
    public new static string NAME = "LoginProxy";
    public LoginProxy() : base(NAME)
    {
    }


    public void InitData()
    {

    }
}
