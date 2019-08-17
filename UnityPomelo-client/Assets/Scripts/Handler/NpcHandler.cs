using DG.Tweening;
using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NpcHandler 
{
    private static NpcHandler _inst;
    public static NpcHandler Inst
    {
        get
        {
            if (_inst == null) _inst = new NpcHandler();
            return _inst;
        }
    }

    public void ChangeArea(int target)
    {
        var areaId = DataManager.Inst.pomelodata.areaId;
        var playerId = DataManager.Inst.pomelodata.playerId;
        JsonObject msg = new JsonObject();
        msg["uid"] = DataManager.Inst.pomelodata.uid;
        msg["playerId"] = playerId;
        msg["areaId"] = areaId;
        msg["target"] = target;
        msg["triggerByPlayer"] = 1;

        PomeloSocket.Inst.Request("area.playerHandler.changeArea", msg, (data) => {
            Debug.Log(data);
        });
    }
}
