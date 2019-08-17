using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectData
{
    public Func<GameObject> getNewObject;
    public GameObject destoryObject { get; set; }
    public int initCount = 5;
    public int enlargeCount = 2;
    public ObjectData() { }
    public ObjectData(int count,int enlarge)
    {
        this.initCount = count;
        this.enlargeCount = enlarge;
    }
}
