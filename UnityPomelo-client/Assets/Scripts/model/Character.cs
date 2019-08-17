using SimpleJson;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Character : Entity
{
    public int level { get; set; }
    public int walkSpeed { get; set; }
    public int hp { get; set; }
    public int maxHp{get;set;}
    public int mp{get;set;}
    public int maxMp { get; set; }
    public int range { get; set; }
    public bool died = false;

    public Character(PlayerData opts, GameObject scene, Map map) : base(opts,scene, map)
    {
        this.level = opts.level;
        this.walkSpeed = opts.walkSpeed;
        this.hp = opts.hp;
        this.maxHp = opts.maxHp;
        this.mp = opts.mp;
        this.maxMp = opts.maxMap;
        this.range = opts.range;
        this.died = false;

        this.sprite = new SpriteUI(this);
    }

    public void resetHp(int maxHp)
    {
        this.set("maxHp", maxHp);
        this.set("hp", this.maxHp);
    }

    public bool hasFullHp()
    {
        return this.hp == this.maxHp;
    }


    public void recoverHp(int hpvalue)
    {
        if (this.hasFullHp()) return;

        var curHp = this.hp;
        var maxHp = this.maxHp;
        if (curHp + hpvalue < maxHp) this.set("hp", this.hp + hpvalue);
        else this.set("hp", maxHp);
    }


    public bool hasFullMp()
    {
        return this.mp == this.maxMp;
    }

    public void resetMp(int maxMp)
    {
        this.set("maxMp", maxMp);
        this.set("mp", maxMp);
    }

    public void recoverMp(int mpValue)
    {
        if (this.hasFullMp()) return;
        var curMp = this.mp;
        var maxMp = this.maxMp;
        if (curMp + mpValue < maxMp) this.set("mp", this.mp + mpValue);
        else this.set("mp", maxMp);
    }

    public void setMaxHp(int hp)
    {
        this.set("maxHp", hp);
        this.set("hp", hp);
    }

    public void setMaxMp(int mp)
    {
        this.set("maxMp", mp);
        this.set("mp", mp);
    }

    /// <summary>
    /// 刷新hp，mp数据
    /// </summary>
    /// <param name="type">hp,mp</param>
    /// <param name="value"></param>
    public override void update(string type, int value)
    {
        int v = type == "hp" ? this.hp - Mathf.Max(value, 0) : this.mp - Mathf.Max(value, 0);
        v = Mathf.Max(v, 0);
        this.set(type, v);
    }

    public override bool isDied()
    {
        return this.died;
    }
}
