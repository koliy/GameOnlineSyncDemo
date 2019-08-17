using DG.Tweening;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/***
 * 所有实物UI的坐标体系都是属于Map对象下，这样好以Map左上角做原点(0,0)管理对应对象的坐标LocalPosition.
 * 这样不管map对象移动的位置在哪里，所有的实物对象坐标体系保持不变
 */
public class SpriteUI 
{
    public Entity entity;
    public GameObject mapNode; 
    public GameObject curNode;
    public HubBarUI bloodbarNode;
    public GameObject nameNode;

    private Character character;
    private Animator animator;
    private List<Vector2Int> curPath = null;
    private float leftDistance =0;
    private float leftTime = 0;

    public SpriteUI(Entity entity)
    {
        this.entity = entity;
        this.mapNode = entity.map.node;
        this.curNode = null;
        this.bloodbarNode = null;
        this.animator = null;
        this._init();
    }

    private void _init()
    {
        Consts.EntityType type = EnumChange<Consts.EntityType>.StringToEnum(this.entity.type);
        if(type == Consts.EntityType.player || type == Consts.EntityType.mob)
        {
            character = (Character)this.entity;
            _initDynamictNode();
            
        }
        else if( type == Consts.EntityType.npc || type == Consts.EntityType.item || type == Consts.EntityType.equipment)
        {
            _initStaticNode();
        }
        setDirection(false);
        this.stand();
    }

    /*
     * 初始化动态节点:玩家，mob
     */ 
    private void _initDynamictNode()
    {
        var obj = this.getAnimatorFromPool(this.entity.kindId, this.entity.type,5);
        if (obj == null)
        {
            Debug.LogError("Create GameObject faild!!!");
            return;
        }
        //作为地图的子对象，所有坐标多相对于父坐标原点(0,0)开始，这样坐标体系好计算，同时，可以设置camera中心对齐:只要移动地图，则所有对象多移动到camera中心处。
        obj.transform.parent = this.mapNode.transform;
        this.animator = obj.GetComponentInChildren<Animator>();

        obj.tag = this.entity.type == "player" ? "Player" : "Mob";
        obj.layer = LayerMask.NameToLayer(obj.tag);
        var position = this.getPosition();
        int x = (int)position.x;
        int y = (int)position.y;

        if (this.curNode != null) MonoBehaviour.Destroy(this.curNode);
        else
        {
            x = this.entity.getPosition().x;
            y = this.entity.getPosition().y;
        }
        obj.transform.localPosition = new Vector3(x, -y, 0); //以左上角为原点坐标轴

        this.curNode = obj;
        this.curNode.name = this.entity.kindName + "_"  + this.entity.type+"_"+ this.entity.entityId;
        Transform txtName = this.curNode.transform.Find("Name");
        txtName.GetComponent<TextMesh>().text = this.entity.name;

        CreateHpBar(this.curNode, txtName.localPosition);

        //test aoi
#if UNITY_EDITOR
        if (this.curNode.GetComponent<TestCharactorAOI>() == null)
        this.curNode.AddComponent<TestCharactorAOI>().Init(this);
#endif

    }
    /**
     * 初始化静态节点:npc,item,equipment
     */ 
    private void _initStaticNode()
    {
        var position = this.getPosition();
        int x = this.entity.getPosition().x;
        int y = this.entity.getPosition().y;

        Consts.EntityType type = EnumChange<Consts.EntityType>.StringToEnum(this.entity.type);
        if (type == Consts.EntityType.npc)
        {
            var obj = this.getAnimatorFromPool(this.entity.kindId, this.entity.type,1);
            if (obj == null)
            {
                Debug.LogError("Create GameObject faild!!!");
                return;
            }
            obj.tag = "Npc";
            obj.layer = LayerMask.NameToLayer("Npc");
            obj.transform.parent = this.mapNode.transform;
            obj.transform.localPosition = new Vector3(x, -y, 0); //以左上角为原点坐标轴
            this.curNode = obj;
            this.curNode.name = this.entity.name + "_" + this.entity.type + "_" + this.entity.entityId;
            this.curNode.transform.Find("Name").GetComponent<TextMesh>().text = this.entity.name;
        }
        else
        {
            var obj = this.getAnimatorFromPool(this.entity.kindId, this.entity.type, 5);
            if (obj == null)
            {
                Debug.LogError("Create GameObject faild!!!");
                return;
            }
            obj.tag = "Item";
            obj.layer = LayerMask.NameToLayer("Item");
            obj.transform.parent = this.mapNode.transform;
            obj.transform.localPosition = new Vector3(x, -y, 0); //以左上角为原点坐标轴
            this.curNode = obj;
            this.curNode.name = this.entity.name + "_" + this.entity.type + "_" + this.entity.entityId;
            this.curNode.transform.Find("Name").GetComponent<TextMesh>().text = this.entity.name;
        }
    }


    
    public Vector2 getPosition()
    {
        if(this.curNode != null)
        {
            return this.curNode.transform.localPosition;
        }
        else
        {
            return Vector2.zero;
        }
    }

    public int getSpeed()
    {
        Character c = (Character)(this.entity);
        return c.walkSpeed;
    }
    public bool isCurPlayer()
    {
        return this.entity != null && this.entity.entityId == App.Inst.getArea().getCurPlayer().entityId;
    }

    public void setDirection(bool isleft)
    {
        if (this.animator != null) this.animator.transform.localScale = new Vector3(isleft ?- 1:1, 1, 1);
    }

    private void CreateHpBar(GameObject mtarget, Vector3 toppos)
    {

        string poolname = "HPBar";
        var pool = App.Inst.getObjectPoolManage().getPool(poolname);
        if(pool == null)
        {
            new ObjectPoolFactory().createHPBarPools(poolname, 20);
            pool = App.Inst.getObjectPoolManage().getPool(poolname);
        }
        GameObject returnObject = null;
        returnObject = pool.getObject();
        if (returnObject == null)
        {
            returnObject = new model.Animation("HPBar", "ui", "").create();
        }

        GameObject canvas = GameObject.Find("Canvas");
        returnObject.transform.SetParent(canvas.transform);
        returnObject.transform.localScale = Vector3.one;
        Vector3 offset = new Vector3(toppos.x, toppos.y + 18, 0);
        HubBarUI hpbar = returnObject.GetComponent<HubBarUI>();
        hpbar.mtarget = mtarget.transform;
        hpbar.offset = offset;
        hpbar.SetDefaultValue(this.character.hp,this.character.maxHp);
     
        this.bloodbarNode = hpbar;
    }

    public GameObject getAnimatorFromPool(int kindId,string type,int initcount)
    {
        GameObject returnObject = null;
        string poolname = Utils.getPoolName(kindId, type);
        var pool = App.Inst.getObjectPoolManage().getPool(poolname);
        if(pool == null)
        {
            new ObjectPoolFactory().createPools(kindId, type, initcount);
            pool = App.Inst.getObjectPoolManage().getPool(poolname);
        }

        returnObject = pool.getObject();

        if(returnObject == null)
        {
            returnObject = new model.Animation(this.entity.kindId+"", this.entity.type, "").create();
        }

        return returnObject;
    }

    public void returnObjectToPool()
    {
        if (this.curNode == null) return;
        this.curNode.transform.DOKill();
        string poolname = Utils.getPoolName(this.entity.kindId, this.entity.type);
        var pool = App.Inst.getObjectPoolManage().getPool(poolname);
        pool.returnObject(this.curNode);
    }

    public void returnHPBarToPool()
    {
        if (this.bloodbarNode == null) return;
        this.bloodbarNode.Clear();
        var pool = App.Inst.getObjectPoolManage().getPool("HPBar");
        pool.returnObject(this.bloodbarNode.gameObject);
    }

    public Vector2 getMapPosition()
    {
        if(this.curNode != null && this.curNode.transform.parent != null)
        {
            return this.entity.map.getCenterPosition();
        }
        else
        {
            return Vector2.zero;
        }
    }

    public void movePath(List<Vector2Int> paths,float speed)
    {
        if(speed <= 0)
        {
            speed = this.getSpeed();
        }

        if (this.curNode == null) return;
        if(paths == null || paths.Count == 0)
        {
            Debug.LogError("invalid Path: " + paths);
            return;
        }
        //AnimatorStateInfo stateinfo = this.animator.GetCurrentAnimatorStateInfo(0);
        //if (stateinfo.IsName("Base Layer.Walk") == false)
        
        this.stopWholeAnimations();
        this.clearPath();

        this.curPath = paths;
        this.leftDistance = Utils.totalDistance(paths);
        if (this.leftDistance == 0) return;

        this.leftTime = Mathf.Floor(this.leftDistance / speed * 1000);
        //a magic accelerate
        if (this.leftTime > 10000) this.leftTime -= 200;
        //start move
        this._movePathStep(1);
    }

    public void stopWholeAnimations()
    {
        this.curNode.transform.DOKill();
        this.stopMove();
    }

    private void clearPath()
    {
        this.curPath = null;
        this.leftDistance = 0;
        this.leftTime = 0;
    }

    private void stopMove()
    {
        if (this.isCurPlayer())
        {
            this.entity.map.stopMove();
        }
    }

    private void stopStand()
    {

    }


    private void stopDied()
    {

    }


    private void walk()
    {
        if (this.animator == null) return;
        //  this.animator.SetBool("Walk", true);
        
        this.animator.CrossFade(Animator.StringToHash("Base Layer.Walk"), 0f);
    }

    public void stand()
    {
        if (this.animator == null) return;
        this.animator.CrossFade(Animator.StringToHash("Base Layer.Idle"), 0f);
    }


    private bool _checkPathStep(int index)
    {
        return this.leftDistance > 0 && this.curPath != null && index < this.curPath.Count;
    }
    /// <summary>
    /// move the path step
    /// Stand and clear current Path if move finish
    /// </summary>
    /// <param name="index"></param>
    private void _movePathStep(int index)
    {
        if (!this._checkPathStep(index)) return;
        if (index == 0) index = 1; //对象起始已在path[0]处
        var start = this.curPath[index - 1];
        var end = this.curPath[index];
        var distance = Utils.Distance(start.x, start.y, end.x, end.y);
        var time = Mathf.Max(Mathf.Floor(this.leftTime * distance / this.leftDistance),1);//移动到下一节点所需的时间
        Debug.Log("move time:" + time);

        this._move(start.x, start.y, end.x, end.y, time, (dt) => {
            index++;
            this.leftDistance -= distance;
            this.leftTime -= dt;
            if (this.leftTime <= 0) this.leftTime = 1;

            if (this._checkPathStep(index))
            {
                this._movePathStep(index);
                return;
            }

            this.stopWholeAnimations();
            this.clearPath();
            this.stand();
        });
    }

    private void _move(int sx,int sy,int ex,int ey,float time,Action<float> cb)
    {
        long startTime = Utils.ConvertDateTimeInt(DateTime.Now);
        
        if(this.curNode != null)
        {
            this.curNode.transform.DOKill();
            var tween= this.curNode.transform.DOLocalMove(new Vector3Int(ex, -ey, 0), time*0.001f).SetEase(Ease.Linear);
            tween.onComplete = ()=> {

                // cb.Invoke(Utils.ConvertDateTimeInt(DateTime.Now) - startTime);
                cb.Invoke(tween.Elapsed() * 1000);
            };
        }
        this.walk();
        if (this.isCurPlayer())
        {
            this.entity.map.moveBackground(new Vector2Int(ex,-ey),time);
        }
       
    }

    public void Attack()
    {
        this.stopWholeAnimations();
        if (this.animator == null) return;
        this.animator.CrossFade(Animator.StringToHash("Base Layer.Atk"), 0f);
    }

    public void translateTo(int x,int y)
    {
        if(this.curNode!= null)
        {
            this.curNode.transform.localPosition = new Vector3(x, y, 0);
        }
    }
    /// <summary>
    /// 创建伤害数字
    /// </summary>
    /// <param name="damage"></param>
    public void createNumberNodes(int damage)
    {

    }

    public void reduceBlood()
    {
        var curHp = this.character.hp;
        if(this.bloodbarNode != null) this.bloodbarNode.UpdateValue(curHp);
    }

    public void zeroBlood()
    {
        if (this.bloodbarNode != null) this.bloodbarNode.UpdateValue(0);
    }

    public void died()
    {

        if (this.entity.entityId == App.Inst.getCurPlayer().entityId)
        {
            AppFacade.Instance.SendNotification(GameNotify.OpenWait);
        }

        this.stopWholeAnimations();
        if(this.entity.type == "player")
        {
            this.animator.CrossFade("Base Layer.Die", 0.1f);
        }
        if (!this.isCurPlayer())
        {
            App.Inst.getArea().removeEntity(this.entity.entityId);
        }
        
    }
    
    public void revive(int x,int y)
    {
        this.reduceBlood();
        this.translateTo(x, -y);
        this.stand();
        if(this.entity.entityId == App.Inst.getCurPlayer().entityId)
        {
            this.entity.map.centerTo(new Vector2(x, y));
            AppFacade.Instance.SendNotification(GameNotify.CloseWait);
        }
        
    }

    public void destroy()
    {
        returnObjectToPool();
        returnHPBarToPool();
        if(this.curPath!= null) this.curPath.Clear();
        this.curPath = null;
        this.entity = null;
        this.character = null;
        this.mapNode = null;
        this.animator = null;
        this.curNode = null;
        this.bloodbarNode = null;
    }
}
