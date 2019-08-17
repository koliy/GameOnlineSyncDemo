using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestCharactorAOI : MonoBehaviour
{
    private Transform mtransform;
    private SpriteUI spirteui;
    private Character entity;
    //AOI
    private int towerWidth = 300;
    private int towerHeight = 300;
    private int towerTileW = 0;
    private int towerTileH = 0;
    private Vector2Int max = Vector2Int.zero;

    // Start is called before the first frame update
    void Start()
    {
        mtransform = transform;
    }

    public void Init(SpriteUI spirteui)
    {
        this.spirteui = spirteui;
        this.entity = (Character)spirteui.entity;

        var map = spirteui.entity.map;
        towerTileW = Mathf.CeilToInt(map.width * 1f / towerWidth);
        towerTileH = Mathf.CeilToInt(map.height * 1f / towerHeight);

        max.x = towerTileW - 1;//下标从0开始
        max.y = towerTileH - 1;
    }

    private void OnDrawGizmos()
    {
        DrawAOI();
    }


    private void DrawAOI()
    {

        if (this.entity == null) return;

        Vector3 pos = this.entity.map.node.transform.position;
        //Vector3 center = new Vector3(pos.x + this.towerWidth * 0.5f, pos.y - this.towerHeight * 0.5f, 0);

        Gizmos.color = Color.red;

        var result = GetPosLimit(mtransform.localPosition, this.entity.range, this.max);
        Vector2Int start = result[0];
        Vector2Int end = result[1];

        //for (int x = start.x; x <= end.x; x++)
        //{
        //    for (int y = start.y; y <= end.y; y++)
        //    {
        //        Gizmos.DrawWireCube(new Vector3(center.x + x * this.towerWidth, center.y - y * this.towerHeight, 10), new Vector3(this.towerWidth, this.towerHeight, 10));
        //    }
        //}
        int xsize = end.x - start.x+1;
        int ysize = end.y - start.y+1;
        var x0 = pos.x + start.x * this.towerWidth;
        var y0 = pos.y - start.y * this.towerHeight;
        Vector3 c = new Vector3(x0 + xsize*this.towerWidth* 0.5f , y0 - ysize * this.towerHeight * 0.5f, 10);

        Gizmos.DrawWireCube(c, new Vector3(xsize * this.towerWidth, ysize * this.towerHeight, 10));
    }



    private Vector2Int transPos(Vector2 pos)
    {
        Vector2Int result = Vector2Int.zero;
        result.x = Mathf.FloorToInt(pos.x / this.towerWidth);
        result.y = Mathf.FloorToInt(Mathf.Abs(pos.y) / this.towerHeight);
        return result;
    }

    private Vector2Int[] GetPosLimit(Vector2 oldpos,int range,Vector2Int max)
    {
        Vector2Int[] result = new Vector2Int[2];
        Vector2Int start =Vector2Int.zero, end = Vector2Int.zero;
        Vector2Int pos = transPos(oldpos);

        //当前aoi格子坐标-范围长度
        if (pos.x - range < 0) //aoi最左边
        {
            start.x = 0;
            end.x = 2 * range;
        }else if(pos.x + range > max.x)
        {
            end.x = max.x;
            start.x = max.x - 2 * range;
        }
        else
        {
            start.x = pos.x - range;
            end.x = pos.x + range;
        }

        if (pos.y - range < 0)
        {
            start.y = 0;
            end.y = 2 * range;
        }
        else if (pos.y + range > max.y)
        {
            end.y = max.y;
            start.y = max.y - 2 * range;
        }
        else
        {
            start.y = pos.y - range;
            end.y = pos.y + range;
        }

        start.x = Mathf.Max(0, start.x);
        start.y = Mathf.Max(0, start.y);
        end.x = Mathf.Max(0, end.x);
        end.y = Mathf.Max(0, end.y);
        result[0] = start;
        result[1] = end;
        return result;
    }




}
