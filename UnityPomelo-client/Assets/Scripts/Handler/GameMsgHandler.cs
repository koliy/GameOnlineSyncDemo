using DG.Tweening;
using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameMsgHandler 
{
    private static GameMsgHandler _inst;
    public static GameMsgHandler Inst
    {
        get
        {
            if (_inst == null) _inst = new GameMsgHandler();
            return _inst;
        }
    }

    public void Init()
    {
        onAddEntities();
        onRemoveEntities();
        onPathCheckOut();
        onMove();
        onAttack();
        onRevive();
        onNpcTalk();
        onChangeArea();
    }

    private void onAddEntities()
    {
        PomeloSocket.Inst.On("onAddEntities", (data) =>
        {
            Debug.Log("onAddEntities:" + data);
            JsonObject entities = data;
            var area = App.Inst.getArea();
            if(area == null)
            {
                Debug.LogWarning("entity not exist!");
                return;
            }
            area.addOtherEntity(data);
        });
    }

    /// <summary>
    /// 移除对象
    /// </summary>
    private void onRemoveEntities()
    {
        PomeloSocket.Inst.On("onRemoveEntities", (data) =>
        {
            Debug.Log("onRemoveEntities:" + data);
            var area = App.Inst.getArea();
            var player = area.getCurPlayer();

            SimpleJSON.JSONNode jsondata = SimpleJSON.JSON.Parse(data["entities"].ToString().Trim());
            SimpleJSON.JSONArray array = jsondata.AsArray;
            if (array == null) return;
            for (int i = 0; i < array.Count; i++)
            {
                if (array[i].AsInt != player.entityId) area.removeEntity(array[i].AsInt);
            }
        });
    }

    /// <summary>
    /// 矫正当前移动坐标
    /// </summary>
    private void onPathCheckOut()
    {
        PomeloSocket.Inst.On("onPathCheckOut", (data) =>
        {
            Debug.Log("onPathCheckOut:" + data);
            var area = App.Inst.getArea();
            var player = area.getEntity(Convert.ToInt32(data["entityId"]));
            var serverPosition = (JsonObject)data["position"];//服务器端当前移动的坐标

            int x = Convert.ToInt32(serverPosition["x"]);
            int y = Convert.ToInt32(serverPosition["y"]);

            var clientPosition = player.getSprite().getPosition();
            var realDistance = Utils.Distance(x, y, Mathf.FloorToInt(clientPosition.x), -Mathf.FloorToInt(clientPosition.y));
            var distanceLimit = 100; //最大误差
            if(realDistance > distanceLimit)
            {
                player.getSprite().translateTo(x, y);
            }
            Debug.Log(realDistance);
        });
    }

    /// <summary>
    /// 其它对象移动事件
    /// </summary>
    private void onMove()
    {
        PomeloSocket.Inst.On("onMove", (data) =>
        {
            Debug.Log("onMove:" + data);
            if (App.Inst.getArea() == null) return;
            var character = App.Inst.getArea().getEntity(Convert.ToInt32(data["entityId"]));
            if (character == null)
            {
                Debug.Log("no find Character "+ data["entityId"]);
                return;
            }
            
            SimpleJSON.JSONNode jsondata = SimpleJSON.JSON.Parse(data["path"].ToString().Trim());
            SimpleJSON.JSONArray array = jsondata.AsArray;
            if (array == null) return;
            List<Vector2Int> paths = new List<Vector2Int>(array.Count);

            for (int i = 0; i < array.Count; i++)
            {
                paths.Add( new Vector2Int(array[i]["x"].AsInt, array[i]["y"].AsInt));
            }

            var sprite = character.getSprite();
            bool isleft = paths[0].x > paths[1].x;
            sprite.setDirection(isleft);

            var totalDistance = Utils.totalDistance(paths);
            //矫正延迟后的速度
            var needTime = Mathf.Floor(totalDistance / sprite.getSpeed() * 1000 - App.Inst.getDelayTime());
            var speed = totalDistance / needTime * 1000;
            sprite.movePath(paths, speed);
        });
    }
    
    /// <summary>
    /// 攻击事件
    /// </summary>
    private void onAttack()
    {
        PomeloSocket.Inst.On("onAttack", (data) =>
        {
            Debug.Log("onAttack:" + data.ToString());

            var area = App.Inst.getArea();
            if (area == null) return;
            var skillId = Convert.ToInt32(data["skillId"]);

            var attacker = area.getEntity(Convert.ToInt32(data["attacker"]));
            var target = area.getEntity(Convert.ToInt32(data["target"]));
            if (attacker == null || target == null)
            {
                Debug.Log("<color=#f10000> attacker or target no exist! </color>");
                return;
            }

            var attackerSprite = attacker.getSprite();
            var targetSprite = target.getSprite();
            var targetPos = targetSprite.getPosition();
            var resultData = data["result"] as JsonObject;
            var _result = Convert.ToInt32(resultData["result"]);
            Consts.AttackResult result = (Consts.AttackResult)_result;
            int damage = Convert.ToInt32(resultData["damage"]);
            int mpUse = Convert.ToInt32(resultData["mpUse"]);

            var _atkpos = data["attackerPos"] as JsonObject;
            var _x = Convert.ToInt32( _atkpos["x"]);
            var _y = Convert.ToInt32(_atkpos["y"]);
            Vector2Int serverPosition = new Vector2Int(_x, -_y);

            switch (result)
            {
                case Consts.AttackResult.SUCCESS:
                    {
                        successAction(attacker, serverPosition, target, mpUse, damage);
                        break;
                    }
                case Consts.AttackResult.KILLED:
                    {
                        object items = null;
                        var isok = resultData.TryGetValue("items", out items);
                        killedAction(attacker, target, items);
                        break;
                    }
                case Consts.AttackResult.NOT_IN_RANGE:
                    {
                        targetSprite.stand();
                        break;
                    }
            }
            
        });
    }

    private void successAction(Entity atker, Vector2Int serverPosition, Entity targeter, int mpUse, int damage)
    {
        var atkSprite = atker.getSprite();
        var targetSprite = targeter.getSprite();
        var clientPosition = atkSprite.getPosition();
        var realDistance = Utils.Distance(serverPosition.x, serverPosition.y, Mathf.FloorToInt(clientPosition.x), Mathf.FloorToInt(clientPosition.y));
        var distanceLimit = 100; //最大误差
        if (realDistance > distanceLimit)
        {
            //矫正攻击者位置
            atkSprite.translateTo(serverPosition.x,serverPosition.y);
        }
        var isleft = clientPosition.x < targetSprite.getPosition().x;
        atkSprite.setDirection(!isleft);
        targetSprite.setDirection(isleft);
        //创建伤害字体
        targetSprite.createNumberNodes(damage);
        //攻击动画
        atkSprite.Attack();

        targeter.update("hp",damage);
        atker.update("mp",mpUse);
        //hp bar
        targetSprite.reduceBlood();
    }

    private void killedAction(Entity atker, Entity target,object itemsinfo)
    {
        if (target.isDied())
        {
            return;
        }

        Character targeter = (Character)target;
        targeter.died = true;
 
        var atkSprite = atker.getSprite();
        var targetSprite = targeter.getSprite();
        targetSprite.zeroBlood();
        targetSprite.died();
        atkSprite.stand();

        //添加掉落物品
        if (itemsinfo == null) return;
        JsonObject msg = new JsonObject();
        msg.Add("item", itemsinfo);
        App.Inst.getArea().addOtherEntity(msg);

    }

    /// <summary>
    /// 玩家复活时间
    /// </summary>
    private void onRevive()
    {
        PomeloSocket.Inst.On("onRevive", (data) =>
        {
            Debug.Log("onRevive:" + data.ToString());

            var area = App.Inst.getArea();
            if (area == null) return;
            var curPlayer = App.Inst.getCurPlayer();
            var entityId = Convert.ToInt32(data["entityId"]);
            if(entityId == curPlayer.entityId) 
            {
                var player = (Player)area.getEntity(entityId);
                player.died = false;
                player.set("hp", Convert.ToInt32(data["hp"]));
                var sprite = player.getSprite();
                sprite.revive(Convert.ToInt32(data["x"]), Convert.ToInt32(data["y"]));
            }
        });
   }

    /// <summary>
    /// NPC对话
    /// </summary>
    private void onNpcTalk()
    {
        PomeloSocket.Inst.On("onNPCTalk", (data) =>
        {
            Debug.Log("onNPCTalk:" + data.ToString());

            var area = App.Inst.getArea();
            if (area == null) return;
            var curPlayer = App.Inst.getCurPlayer();
            var npcid = Convert.ToInt32(data["npc"]);
            var npc = area.getEntity(npcid);
            curPlayer.getSprite().stopWholeAnimations();
            curPlayer.getSprite().stand();
            var npcword = data["npcword"].ToString();
            var myword = data["myword"].ToString();
            object _action = null;
            string action = null;
            int target = -1;
            var isok = data.TryGetValue("action", out _action);
            if (isok)
            {
                action = _action.ToString();
                JsonObject p = data["params"] as JsonObject;
                target = Convert.ToInt32(p["target"]);
            }
            TalkData[] talkDatas = new TalkData[2];
            talkDatas[0] = new TalkData() { name = npc.name+":", msg = npcword };
            talkDatas[1] = new TalkData() { name = "我:", msg = myword ,action=action,target =target};
            
            AppFacade.Instance.SendNotification(GameNotify.OpenTalk, talkDatas);

        });
    }

    /// <summary>
    /// 场景切换
    /// </summary>
    private void onChangeArea()
    {
        PomeloSocket.Inst.On("onChangeArea", (data) =>
        {
            Debug.Log("onChangeArea:" + data.ToString());
            int success = Convert.ToInt32(data["success"]);
            if(success != 1)
            {
                return;
            }
            //停止所有itween
            DOTween.KillAll();
            //清除pools
            App.Inst.getObjectPoolManage().ClearAll();
            //重新设置areaid
            DataManager.Inst.pomelodata.areaId = Convert.ToInt32(data["target"]);
            AppFacade.Instance.SendNotification(GameNotify.LoadChageArea);
        });
    }









}


