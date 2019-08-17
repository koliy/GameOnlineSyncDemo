using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestUI : MonoBehaviour
{
    private Transform mtransform;
    private Map map;
    //AOI
    private int towerWidth = 300;
    private int towerHeight = 300;
    private int towerTileW = 0;
    private int towerTileH = 0;
    // Start is called before the first frame update
    void Awake()
    {
        mtransform = transform;
       // Map map = App.Inst.area.map;
       // transform.position = new Vector3(-map.width / 2f, -map.height / 2f, 0);
       
    }
    public void Init(Map map)
    {
        this.map = map;
        towerTileW = Mathf.CeilToInt(map.width * 1f / towerWidth);
        towerTileH = Mathf.CeilToInt(map.height * 1f / towerHeight);

    }
    void OnDrawGizmos()
    {
        DrawMap();
        DrawAOI();
    }

    //void OnDrawGizmosSelected()
    //{
    //    // Display the explosion radius when selected

    //    DrawMap();

    //    DrawAOI();
    //}


    private void DrawMap()
    {
        if (this.map == null) return;

        //左上角为原点
        // Vector3 pos = new Vector3(transform.position.x - map.width / 2f, transform.position.y + map.height / 2f, 0);
        Vector3 pos = mtransform.position;
        Gizmos.color = Color.black;
        for (int x = 0; x < map.rectH; x++)
        {
            Gizmos.DrawLine(new Vector3(pos.x, pos.y - map.tileH * x, 0), new Vector3(pos.x + map.tileW * map.rectW, pos.y - map.tileH * x, 0));

        }

        for (int y = 0; y < map.rectW; y++)
        {
            Gizmos.DrawLine(new Vector3(pos.x + y * map.tileW, pos.y, 0), new Vector3(pos.x + y * map.tileW, pos.y - map.tileH * map.rectH, 0));
        }

        Gizmos.color = Color.blue;
        Vector3 center = new Vector3(pos.x + map.tileW * 0.5f, pos.y - map.tileH * 0.5f, 0);

        for (int x = 0; x < map.weightMap.Length; x++)
        {
            for (int y = 0; y < map.weightMap[x].Length; y++)
            {
                int state = map.weightMap[x][y];
                if (state == 1) continue;

                Gizmos.DrawCube(new Vector3(center.x + x * map.tileW, center.y - y * map.tileH, 0), new Vector3(map.tileW, map.tileH, 0));
            }
        }
    }



    private void DrawAOI()
    {

        if (this.map == null) return;

        Vector3 pos = mtransform.position;

        Gizmos.color = Color.yellow;
        Vector3 center = new Vector3(pos.x + this.towerWidth * 0.5f, pos.y - this.towerHeight * 0.5f, 0);

        for (int x = 0; x < this.towerTileW; x++)
        {
            for (int y = 0; y < this.towerTileH; y++)
            {
                Gizmos.DrawWireCube(new Vector3(center.x + x * this.towerWidth, center.y - y * this.towerHeight, 0), new Vector3(this.towerWidth, this.towerHeight, 0));
            }
        }
    }
}
