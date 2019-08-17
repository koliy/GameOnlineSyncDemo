using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class ActionManager
{
    private int limit = 1000;
    private Dictionary<string, Dictionary<int, BaseAction>> actionMap;
    private Queue<BaseAction> actionQueue;

    public ActionManager(int limit =0)
    {
        this.limit = Mathf.Max(limit, this.limit);
        this.actionMap = new Dictionary<string, Dictionary<int,BaseAction>>();
        this.actionQueue = new Queue<BaseAction>(this.limit);
    }

    public void addAction(BaseAction action)
    {
        if (action.singleton || 
            (this.actionMap.ContainsKey(action.type) && this.actionMap[action.type].ContainsKey(action.id)))
            this.abortAction(action.type, action.id);
  
        if (!this.actionMap.ContainsKey(action.type))
        {
            var dict = new Dictionary<int, BaseAction>();
            dict.Add(action.id, action);
            this.actionMap.Add(action.type, dict);
        }else
        {
            if (!this.actionMap[action.type].ContainsKey(action.id))
            {
                this.actionMap[action.type].Add(action.id, action);
            }
        }

        this.actionQueue.Enqueue(action);

    }

    public void abortAction(string type,int id)
    {
        if (!this.actionMap.ContainsKey(type) || !this.actionMap[type].ContainsKey(id)) return;

        this.actionMap[type][id].aborted = true;
        this.actionMap[type].Remove(id);
    }

    public void abortAllAction(int id)
    {
        foreach(var p in this.actionMap)
        {
            if (p.Value.ContainsKey(id)) p.Value[id].aborted = true;
        }
    }

    public void update()
    {
        var length = this.actionQueue.Count;
        if (length == 0) return;
        var action = this.actionQueue.Dequeue();
        if (action.aborted) return;
        action.update();

        if (!action.finished) this.actionQueue.Enqueue(action);
        else this.actionMap[action.type].Remove(action.id);
        
    }
}
