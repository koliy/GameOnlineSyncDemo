using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool 
{
    public ObjectData objdata;
    public List<GameObject> pool;
    public int index = 0,maxCount;
    private GameObject poolroot;
    public ObjectPool(string poolname,ObjectData data = null)
    {
        poolroot = new GameObject(poolname+"_pool");
        poolroot.transform.position = new Vector3(10000, 10000, 0);
        MonoBehaviour.DontDestroyOnLoad(poolroot); //避免场景加载释放
        objdata = new ObjectData();
        if (data != null)
        {
            objdata.getNewObject = data.getNewObject;
            objdata.destoryObject = data.destoryObject;
            objdata.initCount = data.initCount;
            objdata.enlargeCount = data.enlargeCount;
        }
        index = 0;
        maxCount = 15;
        pool = new List<GameObject>();

        initialize();
    }


    private void initialize()
    {
        if (objdata == null || objdata.getNewObject == null) return;
        for(int i = 0; i < objdata.initCount; i++)
        {
            GameObject obj = objdata.getNewObject.Invoke();
            obj.transform.SetParent(poolroot.transform);
            obj.transform.localPosition = Vector3.zero;
            obj.SetActive(false);
            pool.Add(obj);
        }

        index = objdata.initCount;
    }

    public void destory()
    {
        int n = pool.Count;
        for(int i = 0; i < n; i++)
        {
           if(pool[i]!= null) MonoBehaviour.Destroy(pool[i]);
           pool[i] = null;
        }

        pool.Clear();pool = null;
        objdata = null;
        MonoBehaviour.Destroy(poolroot);
        poolroot = null;
    }

    public void returnObject(GameObject obj)
    {
        if (index >= pool.Count)
        {
            MonoBehaviour.Destroy(obj);
            return;
        }
        if (obj == null) return;
        obj.transform.SetParent(this.poolroot.transform);
        obj.transform.localPosition = Vector3.zero;
        obj.SetActive(false);
        pool[index++] = obj;
    }
    
    public GameObject getObject()
    {
        if (index > 0)
        {
            GameObject obj = pool[--index];
            if(obj!= null ) obj.SetActive(true);
            return obj;
        }
        if (pool.Count > maxCount) return null;

        for (int i = 0; i < objdata.enlargeCount; i++)
        {
            GameObject obj = objdata.getNewObject.Invoke();
            obj.transform.parent = poolroot.transform;
            obj.transform.localPosition = Vector3.zero;
            obj.SetActive(false);
            pool.Insert(0, obj);
        }
        this.index = objdata.enlargeCount;

        return this.getObject();
    }
}
