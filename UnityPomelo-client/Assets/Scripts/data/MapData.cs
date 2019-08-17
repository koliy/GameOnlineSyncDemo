using SimpleJson;
using System.Collections;
using System.Collections.Generic;


public class MapData 
{
    public string name;
    public int width;
    public int height;
    public int tileW;
    public int tileH;
    public List<WeightMapData> weightMap;
    public MapData()
    {
        weightMap = new List<WeightMapData>();
        tileW = 0;tileH = 0;width = 0;height = 0;
    }
    public void Clear()
    {
        weightMap.Clear();
    }
    public override string ToString()
    {
        return name + ",width:" + width + ",height:" + height + ",tileW:" + tileW + ",tileH:" + tileH + ",weightMap:" + weightMap;
    }
}
public class WeightMapData
{
    public int row;
    private CollisionData[] collisions;

    public WeightMapData(int i,int count)
    {
        row = i;
        collisions =  new CollisionData[count];
    }

    public void Add(int i,CollisionData data)
    {
        collisions[i]=data;
    }

    public CollisionData[] Get()
    {
        return collisions;
    }
}
public class CollisionData
{
    public int start;
    public int length;
}
