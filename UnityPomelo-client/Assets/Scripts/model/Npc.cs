using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Npc : Entity
{
    // Start is called before the first frame update
    public int id;
    public Entity target;

    public Npc(EntityData opts, GameObject scene, Map map) : base(opts, scene, map)
    {
        this.id = opts.id;
        this.type = this.type = EnumChange<Consts.EntityType>.EnumToString(Consts.EntityType.npc);
        this.name = opts.name;
        this.target = null;

        this.sprite = new SpriteUI(this);
    }
}
