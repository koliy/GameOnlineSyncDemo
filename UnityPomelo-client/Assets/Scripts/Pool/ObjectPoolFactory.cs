using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectPoolFactory 
{


    public void createPools(int kindId,string type, int initcount =5)
    {
        string poolname = kindId + "_" + type;
        ObjectPool objectpool = createPool(poolname,kindId+"", type, initcount);
        ObjectPoolManager.Inst.addPool(poolname, objectpool);
    }

    private ObjectPool createPool(string poolname,string kindId,string types,int initcount)
    {
        ObjectData _objdata = new ObjectData()
        {
            initCount = initcount,
            getNewObject = () => { return new model.Animation(kindId, types, "").create(); }

        };

        return new ObjectPool(poolname,_objdata);
    }

    public void createHPBarPools(string poolname, int initcount = 5)
    {
        ObjectPool objectpool = createPool(poolname, "HPBar", "ui", initcount);
        ObjectPoolManager.Inst.addPool(poolname, objectpool);
    }

}
