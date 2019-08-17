using SimpleJson;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CurPlayer : Player
{
    public JsonObject characterdata;
    public int skillPoint = 0;
    public long experience;
    public int attackValue;
    public int defencevalue;
    public int hitRate;
    public int dodgeRate;
    public int attackSpeed;
    public long nextLevelExp;

    public CurPlayer(PlayerData opts, GameObject scene, Map map) : base(opts, scene, map)
    {
        Debug.Log("curPlayer ~ this.kindId = " + this.kindId);
        this.characterdata = DataApi.Inst.character.FindById(this.kindId);
        this.skillPoint = opts.skillPoint;
        this.experience = opts.experience;
        this.attackValue = opts.attackValue;
        this.defencevalue = opts.defenceValue;
        this.hitRate = opts.hitRate;
        this.dodgeRate = opts.dodgeRate;
        this.attackSpeed = opts.attackSpeed;
        this.nextLevelExp = opts.nextLevelExp;
    }


}
