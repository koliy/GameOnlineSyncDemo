using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TimeSync: IDisposable
{
    private float delayTime = 0f;//秒
    private float TIME_OUT = 60;//秒

    public TimeSync()
    {
        vp_Timer.In(0, getDelayTime, -1,TIME_OUT);
    }

    private void getDelayTime()
    {
        var beforeTime = Utils.ConvertDateTimeInt(DateTime.Now);
        JsonObject msg = new JsonObject();
        msg["clientTime"] = beforeTime;
        PomeloSocket.Inst.Request("connector.timeSyncHandler.timeSync", msg, (result) => {
            int code = Convert.ToInt32(result["code"]);
            if(code == 200)
            {
                var afterTime = Utils.ConvertDateTimeInt(DateTime.Now);
                delayTime = (afterTime - beforeTime) * 0.5f;
                App.Inst.setDelayTime(delayTime);
                Debug.Log("TimeSync Time :" + delayTime);
            }
        });
    }





    public void Dispose()
    {
        vp_Timer.CancelAll("getDelayTime");
    }

}
