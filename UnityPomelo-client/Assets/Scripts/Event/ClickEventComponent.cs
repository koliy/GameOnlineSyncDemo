using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ClickEventComponent : MonoBehaviour
{
    private int nNpcLayer, nMobLayer, nPlayerLayer, nItemLayer;
    // Start is called before the first frame update
    void Start()
    {
        nNpcLayer = LayerMask.NameToLayer("Npc");
        nMobLayer = LayerMask.NameToLayer("Mob");
        nPlayerLayer = LayerMask.NameToLayer("Player");
        nItemLayer = LayerMask.NameToLayer("Item");
    }
    
    void OnMouseEnter()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit2D rayHit = Physics2D.Raycast(ray.origin, Vector3.forward, 100f, 1 << nNpcLayer | 1 << nMobLayer | 1 << nPlayerLayer | 1 << nItemLayer);
     
        if (rayHit.collider != null)
        {
            string[] infos = rayHit.collider.gameObject.name.Split('_');
            if (infos.Length < 2) return;
            string type = infos[1], ids = infos[2];
            int entityId = System.Convert.ToInt32(ids);
            //本人
            if (entityId == DataManager.Inst.playerdata.entityId) return;

            switch (rayHit.collider.tag)
            {
                case "Player":
                    {
                        App.Inst.cursorServer.OnMouseEnter(false);
                        break;
                    }
                case "Npc":
                    {
                        App.Inst.cursorServer.OnMouseEnter(false);
                        break;
                    }
                case "Mob":
                    {
                        App.Inst.cursorServer.OnMouseEnter(true);
                        break;
                    }
                case "Item":
                    {
                        break;
                    }
            }
        }
   
    }

    void OnMouseExit()
    {
        App.Inst.cursorServer.OnMouseExit();
    }

    //鼠标弹起时候触发，后于move动作,以免rpc调用覆盖数据
    private void OnMouseUp()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit2D rayHit = Physics2D.Raycast(ray.origin, Vector3.forward, 100f, 1 << nNpcLayer | 1 << nMobLayer | 1 << nPlayerLayer | 1 << nItemLayer);

        if (rayHit.collider != null)
        {
            string[] infos = rayHit.collider.gameObject.name.Split('_');
            if (infos.Length < 2) return;
            string ids = infos[2];
            int targetId = System.Convert.ToInt32(ids);
            //Debug.LogFormat("<color=#0ff000> ===>{0},{1} </color>", type, entityId);
            //本人
            if (targetId == DataManager.Inst.playerdata.entityId) return;

            int areaId = DataManager.Inst.playerdata.areaId;
            int playerId = DataManager.Inst.playerdata.id;

            var area = App.Inst.getArea();
            var entity = area.getEntity(targetId);
            if (entity.isDied()) return;
            Consts.EntityType type = EnumChange<Consts.EntityType>.StringToEnum(entity.type);
            switch (type)
            {
                case Consts.EntityType.player:
                    {
                        var curPlayer = App.Inst.getCurPlayer();
                        AppFacade.Instance.SendNotification(GameNotify.OpenPlayerDialog, entity);
                        
                        break;
                    }
                case Consts.EntityType.npc:
                    {
                        SimpleJson.JsonObject msg = new SimpleJson.JsonObject();
                        msg["areaId"] = areaId;
                        msg["playerId"] = playerId;
                        msg["targetId"] = targetId;
                        PomeloSocket.Inst.Notify("area.playerHandler.npcTalk", msg);

                        break;
                    }
                case Consts.EntityType.mob:
                    {
                        SimpleJson.JsonObject msg = new SimpleJson.JsonObject();
                        msg["targetId"] = targetId;
                        PomeloSocket.Inst.Request("area.fightHandler.attack", msg, (data) => {
                            
                        });
                        break;
                    }
                case Consts.EntityType.item:
                case Consts.EntityType.equipment:
                    {
                        SimpleJson.JsonObject msg = new SimpleJson.JsonObject();
                        msg["areaId"] = areaId;
                        msg["playerId"] = playerId;
                        msg["targetId"] = targetId;
                        PomeloSocket.Inst.Request("area.playerHandler.pickItem", msg,(data) => { });
                        break;
                    }
                
            }

        }
    }

}
