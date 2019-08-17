using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class LoginMsgHandler
{
    private static LoginMsgHandler _inst;
    public static LoginMsgHandler Inst
    {
        get
        {
            if (_inst == null) _inst = new LoginMsgHandler();
            return _inst;
        }
    }

    public void Init()
    {
        //服务器踢出
        PomeloSocket.Inst.On("onKick", (data) =>
        {
            Debug.Log("onKick...");
            SceneManager.LoadScene("Login");
        });

        PomeloSocket.Inst.On("disconnect", (reason) =>
        {
            Debug.Log("disconnect:" + reason);
            SceneManager.LoadScene("Login");
        });

        //对象离线
        PomeloSocket.Inst.On("onUserLeave", (data) => {
            Debug.Log("onUserLeave:" + data);
            var area = App.Inst.getArea();
            var playerId = Convert.ToInt32(data["playerId"]);

            area.removePlayer(playerId);
        });
    }
}
