using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BaseAction
{
    public int id;
    public string type;
    public bool finished;
    public bool aborted;
    public bool singleton;

    public BaseAction()
    {
        this.finished = false;
        this.aborted = false;
        this.singleton = false;
    }

    public virtual void update()
    {

    }

}
