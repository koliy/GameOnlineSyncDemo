using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ComponentAdder 
{
    private Area area;
    public ComponentAdder(Area area)
    {
        this.area = area;
    }

    public void addComponent()
    {
        addClickComponent(area);
    }

    public void addComponentTo(Entity e)
    {
        addComponentToEntity(this.area, e);
    }

    public void addComponentToEntity(Area area,Entity e)
    {
        var node = e.getSprite().curNode;
        if (node.GetComponent<ClickEventComponent>() == null) node.AddComponent<ClickEventComponent>();

    }

    public void addClickComponent(Area area)
    {
        if (area.map.node.GetComponent<MouseMoveEventComponent>() == null)
        area.map.node.AddComponent<MouseMoveEventComponent>().Init(area);
    }
}
