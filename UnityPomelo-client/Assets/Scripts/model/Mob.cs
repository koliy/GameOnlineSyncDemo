using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Mob : Character
{
    public Mob(PlayerData opts, GameObject scene, Map map) : base(opts, scene, map)
    {
        this.type = EnumChange<Consts.EntityType>.EnumToString(Consts.EntityType.mob);
    }
}
