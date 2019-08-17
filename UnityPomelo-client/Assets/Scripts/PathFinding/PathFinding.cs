using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class TileInfo: IComparer<TileInfo>
{
    public int x { get; set; }
    public int y { get; set; }
    /**
     * 此节点已处理标志
     */ 
    public bool processed { get; set; }
    public TileInfo prev { get; set; }
    /*代价:表示从初始节点到任意节点n的代价，当前节点的C值等于移动前节点的C值加上移动到当前节点的距离。*/
    public float cost { get; set; }
    /*启发式估值：表示从节点n到目标点的启发式评估代价*/
    public float heuristic { get; set; }

    public int Compare(TileInfo t1, TileInfo t2)
    {
        int result = 0;
        if (t2.heuristic - t1.heuristic > 0) result = 1;
        else if (t2.heuristic - t1.heuristic == 0) result = 0;
        else result = -1;
        return result;
    }
}

[Serializable]
public class PathInfo
{
    [SerializeField]
    public List<Vector2Int> paths;
    public float cost;
}

public class PathFinding 
{
    private const int CAN_NOT_MOVE = 0;
    private TileInfo[][] tiles;
    public PathFinding(Map map)
    {
        tiles = new TileInfo[map.rectH][];
    }

    public float distance(float dx,float dy)
    {
        return Mathf.Sqrt(dx*dx + dy*dy);
    }

    private bool assert(bool exp,string msg)
    {
        if (exp) return true;
        else
        {
            var theMsg = msg == null ? "assert !!!" : msg;
            Debug.Log("exception throwed: " + theMsg);
            throw new Exception(theMsg);
        }
    }


    private TileInfo getTileInfo(int x,int y,Map map)
    {
        var row = tiles[y];
        if(row == null)
        {
            row = new TileInfo[map.rectW];
            tiles[y] = row;
        }
        var tileInfo = row[x];
        if(tileInfo == null)
        {
            tileInfo = new TileInfo()
            {
                x = x,
                y = y,
                processed = false,
                prev = null,
                cost =0,
                heuristic =0
            };
            row[x] = tileInfo;
        }

        return tileInfo;
    }

    private void clearTileInfo()
    {
        foreach(var row in tiles)
        {
            if (row == null) continue;
            foreach(var p in row)
            {
                if (p == null) continue;
                p.processed = false;
                p.prev = null;
                p.cost = 0;
                p.heuristic = 0;
            }
        }
    }


    public PathInfo finder(int sx,int sy,int gx,int gy, Map map)
    {
        
        if (map.getWeight(gx, gy) == CAN_NOT_MOVE) return null;
        
        clearTileInfo();

        var queue = new PriorityQueue<TileInfo>(100,new TileInfo());
        bool found = false;

        //start point
        var ft = getTileInfo(sx, sy,map);
        ft.cost = 0;
        ft.heuristic = 0;
        queue.Push(ft);

        while(0< queue.Count)
        {
            
            var footTile = queue.Pop();
            int x = footTile.x;
            int y = footTile.y;

           // Debug.Log(footTile.x+","+ footTile.y+","+ footTile.cost+",p:"+footTile.processed);

            if (x == gx && y == gy)
            {
                found = true;
                break;
            }
            //跳过已处理过的节点
            if (footTile.processed) continue;
            footTile.processed = true;

            Action<int, int, int> processReachable = (theX, theY, weight) =>
            {
                if (weight == CAN_NOT_MOVE) return; //不可达

                var neighbourTile = getTileInfo(theX, theY,map);
                if (neighbourTile.processed) return;

                var costFromSrc = footTile.cost + weight * distance(theX - x, theY - y);
                if (neighbourTile.prev == null || costFromSrc < neighbourTile.cost) //假设此相邻节点到上一级节点的代价更小，则更新该相邻点的C值为较小的那个,更新它的父节点。
                {
                    neighbourTile.cost = costFromSrc;
                    neighbourTile.prev = footTile;
                    var distToGoal = distance(theX - gx, theY - gy);
                    neighbourTile.heuristic = costFromSrc + distToGoal;
                    queue.Push(neighbourTile);
                }
            };

            map.forAllReachable(x, y, processReachable);
        }
        queue.Dispose();
        if (!found) return null;
        //获取找到的最近路径节点
        List<Vector2Int> paths = null;
        var goalTile = getTileInfo(gx, gy,map);
        var t = goalTile;
        while (t != null)
        {
            if (paths == null) paths = new List<Vector2Int>();
            paths.Add(new Vector2Int(t.x, t.y));
            t = t.prev;
        }

        paths.Reverse();

        return new PathInfo() { paths = paths, cost = goalTile.cost };
    }


}
