using SimpleJson;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Entity 
{
    public int entityId;
    public int kindId;
    public string kindName;
    public string englishName;
    public string name;
    public string type;
    private Vector2Int pos = Vector2Int.zero;
    public Map map;
    public GameObject scene;
    public SpriteUI sprite;

    public Entity(EntityData playerdata, GameObject scene,Map map)
    {
        this.entityId = playerdata.entityId;
        this.kindId = playerdata.kindId;
        this.kindName = playerdata.kindName;
        this.englishName = playerdata.englishName;
        this.name = playerdata.name;

        this.type = playerdata.type;
        this.pos.x = playerdata.x;
        this.pos.y = playerdata.y;
        this.map = map;
        this.scene = scene;

    }

    public int getKindId()
    {
        return kindId;
    }

    public void setPosition(int x,int y)
    {
        pos.x = x;
        pos.y = y;
    }

    public Vector2Int getPosition()
    {
        return pos;
    }

    public SpriteUI getSprite()
    {
        return this.sprite;
    }

    public void destroy()
    {
        var sprite = this.getSprite();
        sprite.destroy();
    }

    public void set(string property,object value)
    {
        this.GetType().GetProperty(property).SetValue(this,value);

    }

    public virtual bool isDied()
    {
        return false;
    }
    /// <summary>
    /// 刷新hp，mp数据
    /// </summary>
    /// <param name="type">hp,mp</param>
    /// <param name="value"></param>
    public virtual void update(string type,int value)
    {
        
    }
}
