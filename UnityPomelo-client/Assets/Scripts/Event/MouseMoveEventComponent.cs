using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;

public class MouseMoveEventComponent : MonoBehaviour
{
    private Entity player;
    private SpriteUI sprite;
    // Start is called before the first frame update
    void Start()
    {
        
    }
    public void Init(Area area)
    {
        player = area.getCurPlayer();
        sprite = player.getSprite();

    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButtonDown(0))//鼠标按下时候触发，先于攻击，对话动作
        {
            Vector3 pos = Camera.main.ScreenToWorldPoint(new Vector3(Input.mousePosition.x, Input.mousePosition.y, 10));
            //Debug.Log(pos);
            Move(pos);
        }
    }


    PathInfo _defaultPath, _compressPath2, _compressPath1;
    private void Move(Vector3 targetpos)
    {
        if (player.isDied()) return;

        var newpos = sprite.curNode.transform.parent.InverseTransformPoint(targetpos);
        var endX = Mathf.FloorToInt(newpos.x);
        var endY = Mathf.Abs(Mathf.FloorToInt(newpos.y));
        var startX = Mathf.FloorToInt(sprite.getPosition().x);
        var startY = Mathf.Abs(Mathf.FloorToInt(sprite.getPosition().y));

        Debug.DrawLine(sprite.curNode.transform.position, targetpos, Color.red,1f);
        Debug.Log("================== ");
        Debug.Log("start pos : "+startX+","+ startY);
        //Debug.Log("end pos : " + endX + "," + endY);
        var map = App.Inst.getArea().map;
     

        System.Diagnostics.Stopwatch stopwatch = new System.Diagnostics.Stopwatch();
        stopwatch.Start();

        var paths = map.findPath(startX, startY, endX, endY);

        stopwatch.Stop();
        //获取当前实例测量得出的总时间        
        System.TimeSpan timespan = stopwatch.Elapsed;
        double milliseconds = timespan.TotalMilliseconds;  //  总毫秒数   
        Debug.Log("A* 寻路计算时间(ms):" + milliseconds);

        if (paths == null || paths.paths == null) return;

        #region 测试tile路径
        {
            _compressPath2 = map._compressPath2;
            _compressPath1 = map._compressPath1;
            _defaultPath = map._defaultPath;
        }
        #endregion

        var totalDistance = Utils.totalDistance(paths.paths);
        //网络数据延迟，同步好时间
        var needTime = Mathf.Floor(totalDistance / sprite.getSpeed() * 1000 + App.Inst.getDelayTime());
        //延迟矫正后的加速
        var speed = totalDistance / needTime * 1000f;
        Debug.Log("d:" + totalDistance + ",t:" + needTime + ",s:" + speed);
        bool isleft = startX > endX;
        sprite.setDirection(isleft);
        //1,
        sprite.movePath(paths.paths, speed);
        //把List数据序列化json格式
        string str = JsonUtility.ToJson(paths);
        JsonObject msg = (JsonObject)SimpleJson.SimpleJson.DeserializeObject(str);
        PomeloSocket.Inst.Request("area.playerHandler.move", msg, (result) => {
            int code = Convert.ToInt32(result["code"]);
            if(code == 500)//err
            {
                Debug.LogError("curPlayer move error!");
                sprite.translateTo(paths.paths[0].x, paths.paths[0].y);
            }
        });
        //2,
       // sprite.movePath(paths.paths,-1);
    }

    void OnDrawGizmos()
    {
        DrawPath();
        DrawCompress2Path();
        DrawCompress1Path();
    }


    private void DrawPath()
    {
        if (_defaultPath == null) return;

        var map = App.Inst.getArea().map;
        Vector3 pos = transform.position;

        Gizmos.color = Color.red;
        Vector3 center = new Vector3(pos.x + map.tileW * 0.5f, pos.y - map.tileH * 0.5f, 0);

        for (int i = 0; i < _defaultPath.paths.Count; i++)
        {
            int x = _defaultPath.paths[i].x;
            int y = _defaultPath.paths[i].y;
            Gizmos.DrawCube(new Vector3(center.x + x * map.tileW, center.y - y * map.tileH, 0), new Vector3(map.tileW, map.tileH, 0));
        }
    }

    private void DrawCompress2Path()
    {
        if (_compressPath2 == null) return;
        var map = App.Inst.getArea().map;

        Vector3 pos = transform.position;
        Vector3 center = new Vector3(pos.x + map.tileW * 0.5f, pos.y - map.tileH * 0.5f, 0);
    
        Gizmos.color = Color.green;
        for (int i = 0; i < _compressPath2.paths.Count; i++)
        {
            int x = _compressPath2.paths[i].x;
            int y = _compressPath2.paths[i].y;
            
            Gizmos.DrawCube(new Vector3(pos.x + x , pos.y -y, 0), new Vector3(map.tileW, map.tileH, 0));
        }
      
    }


    private void DrawCompress1Path()
    {
        if (_compressPath1 == null) return;
        var map = App.Inst.getArea().map;

        Vector3 pos = transform.position;

        Gizmos.color = Color.yellow;
        for (int i = 0; i < _compressPath1.paths.Count; i++)
        {
            int x = _compressPath1.paths[i].x;
            int y = _compressPath1.paths[i].y;

            Gizmos.DrawCube(new Vector3(pos.x + x, pos.y - y, 0), new Vector3(map.tileW, map.tileH, 0));
        }

    }
}
