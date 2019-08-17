using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectPoolManager 
{
    private static ObjectPoolManager _inst;
    public static ObjectPoolManager Inst
    {
        get
        {
            if (_inst == null) _inst =  new ObjectPoolManager();
            return _inst;
        }
    }

    private Dictionary<string, ObjectPool> pools;
    public ObjectPoolManager()
    {
        pools = new Dictionary<string, ObjectPool>();
    }
    public void addPool(string name,ObjectPool pool)
    {
        if (pools.ContainsKey(name)) pools[name] = pool;
        else pools.Add(name, pool);
    }
 
    public ObjectPool getPool(string name)
    {
        if (pools.ContainsKey(name)) return pools[name];
        else return null;
    }

    public void destroy(string name)
    {
        if (pools.ContainsKey(name)) pools[name].destory();
    }

    public void ClearAll()
    {
        foreach(var p in pools)
        {
            p.Value.destory();
        }
        pools.Clear();
    }
}
