using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : Character
{
    public int id;
    public Entity target;

    public Player(PlayerData opts, GameObject scene, Map map) : base(opts, scene, map)
    {
        this.id = opts.id;
        this.type = EnumChange<Consts.EntityType>.EnumToString(Consts.EntityType.player);
        this.target = null;
    }


}
