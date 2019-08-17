using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Item : Entity
{
    public string desc;
    public int hp;
    public int mp;
    public int price;
    public int heroLevel;
    public int imgId;
    public int kind;

    public Item(ItemData opts, GameObject scene, Map map) : base(opts, scene, map)
    {
        this.type = EnumChange<Consts.EntityType>.EnumToString(Consts.EntityType.item);
        this.name = opts.name;
        this.desc = opts.desc;
        this.kind = opts.kind;
        this.hp = opts.hp;
        this.mp = opts.mp;
        this.price = opts.price;
        this.heroLevel = opts.heroLevel;
        this.imgId = opts.imgId;
        this.kindId = imgId;
        this.sprite = new SpriteUI(this);
    }
    
}
