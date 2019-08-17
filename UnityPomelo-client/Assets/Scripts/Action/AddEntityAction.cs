using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AddEntityAction : BaseAction
{
    private EntityData entity;
    public AddEntityAction(EntityData data) :base()
    {
        this.type = "Add";
        this.id = data.entityId;
        this.entity = data;

    }

    public override void update()
    {
        App.Inst.getArea().addEntity(this.entity);
        this.finished = true;
    }

}
