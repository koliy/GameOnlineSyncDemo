using DG.Tweening;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Map
{
    public GameObject node,scene;
    public string name = null;
    public int[][] weightMap = null;
    private Vector2 initPos = Vector2.zero;
    private Vector2 centerPosition = Vector2.zero; //地图中心原点坐标
    public int width, height,tileW,tileH,rectW,rectH;

    private PathFinding pfinder = null;

    public Map(MapData mapdata,GameObject scene,Vector2 pos)
    {
        name = mapdata.name;
        this.scene = scene;
        initPos = pos != null ? pos: Vector2.zero;
        width = mapdata.width;
        height = mapdata.height;
        initMapData(mapdata);
        loadMap();

        DrawMapTile();
    }

    private void initMapData(MapData mapdata)
    {
        tileW = mapdata.tileW == 0 ? 20: mapdata.tileW;
        tileH = mapdata.tileH == 0 ? 20 : mapdata.tileH;
        rectW = Mathf.CeilToInt(width / tileW);
        rectH = Mathf.CeilToInt(height / tileH);
        Debug.Log(tileW + "," + tileH + "," + rectW + "," + rectH + "," + width + "," + height);

        weightMap = getWeightMap(mapdata.weightMap);
        pfinder = new PathFinding(this);
      
    }

    public int getWeight(int x,int y)
    {
        return this.weightMap[x][y];
    }

    private int[][] getWeightMap(List<WeightMapData> weightdatas)
    {
        int[][] map = new int[rectW][];
     
        for(int x = 0; x < rectW; x++)
        {
            map[x] = new int[rectH];
            for (int y = 0; y < rectH; y++) map[x][y] = 1;
        }

        for(int x = 0; x < weightdatas.Count; x++)
        {
            var array = weightdatas[x].Get();
            if (array == null || array.Length == 0) continue;
            for(int j = 0; j < array.Length; j++)
            {
                var c = array[j];
                for (int k = 0; k < c.length; k++)
                {
                    map[x][c.start + k] = 0;
                }
            }
        }

        return map;
    }


    private void loadMap()
    {
        
        var pos = this.initPos;
        Sprite mapImage = Resources.Load<Sprite>("map/desert");
        GameObject imgModel = new GameObject();
        imgModel.transform.parent = this.scene.transform;
        SpriteRenderer spr = imgModel.AddComponent<SpriteRenderer>();

        spr.sprite = mapImage;
        spr.sortingOrder = -10;
        spr.color = Color.gray;
        spr.drawMode = SpriteDrawMode.Sliced;
        spr.size = new Vector2(this.width, this.height);
        spr.name = this.name+"Map";
        this.node = imgModel;
        imgModel.gameObject.AddComponent<TestUI>().Init(this);

        //以左上角为地图轴心
        //map图片设置了左上角为轴心
       // Debug.Log(Screen.width + ":" + Screen.height+":"+ Screen.width * 1f / Screen.height  );
        //适配各个分辨率
        float size = Camera.main.orthographicSize;//UI以固定高度为主
        float ratio = size / Screen.height;
        this.centerPosition = new Vector3(-Mathf.RoundToInt(Screen.width * ratio), size,-1);
        this.node.transform.localPosition = centerPosition;
        
    }

    /***
     * camera固定不动，因所有子对象在map对象里面成独立坐标体系，移动map则对准了camera中心
     */ 
    public void centerTo(Vector2 pos)
    {
        if (this.node == null) return;

        var width = Utils.ScreenWidth;
        var height = Utils.ScreenHeight;


        var maxX = this.width - width - 10;//最大偏移距离，最后刚好显示一屏
        var maxY = this.height - height - 10;
        int offX = Mathf.RoundToInt(pos.x - width /2); //偏移值
        int offY = Mathf.RoundToInt(Mathf.Abs(pos.y) - height/2);

        if (offX < 0) offX = 0;
        else if (offX > maxX) offX = maxX;
  
        if (offY < 0) offY = 0;
        else if (offY > maxY) offY = maxY;
      
        this.node.transform.localPosition = new Vector3(this.centerPosition.x -offX, this.centerPosition.y + offY, -1);
        Debug.Log(this.centerPosition);
        Debug.Log("Map offset X:" + offX + ",Y:" + offY);
    }

    public Vector2 getCenterPosition()
    {
        return this.centerPosition;
    }

    public Vector2Int getPosition()
    {
        var _mpos = this.node.transform.localPosition;
        return new Vector2Int(Mathf.FloorToInt(_mpos.x), Mathf.FloorToInt(_mpos.y));
    }
    /****
     *  x， y: tile 的格子坐标,0起始
     *  判断当前格子的上下左右四格是否可达
     * 
     */ 
    public void forAllReachable(int x,int y ,Action<int,int,int> processReachable)
    {
        int x1 = x - 1, x2 = x + 1;
        int y1 = y - 1, y2 = y + 1;
        x1 = Mathf.Max(0, x1);
        y1 = Mathf.Max(0, y1);
        x2 = Mathf.Min(this.rectW -1, x2);
        y2 = Mathf.Min(this.rectH - 1, y2);

        if (y > 0)
        {
            processReachable(x, y1, this.weightMap[x][y1]);
        }
        if(y2 < this.rectH)
        {
            processReachable(x, y2, this.weightMap[x][y2]);
        }
        if(x > 0)
        {
            processReachable(x1, y, this.weightMap[x1][y]);
        }
        if (x2 < this.rectW)
        {
            processReachable(x2, y, this.weightMap[x2][y]);
        }
        //对角点
        //if(x>0 && y > 0)
        //{
        //    processReachable(x1, y1, this.weightMap[x1][y1]);
        //}

        //if (x2 < this.rectW && y2 < this.rectH)
        //{
        //    processReachable(x2, y2, this.weightMap[x2][y2]);
        //}

        //if(x>0 && y2 < this.rectH)
        //{
        //    processReachable(x1, y2, this.weightMap[x1][y2]);
        //}

        //if(y>0 && x2 < this.rectW)
        //{
        //    processReachable(x2, y1, this.weightMap[x2][y1]);
        //}
    }

    private bool isReachable(float x,float y)
    {
        if (x < 0 || y < 0 || x > this.width || y > this.height) return false;
        var x1 = Mathf.FloorToInt(x / this.tileW);
        var y1 = Mathf.FloorToInt(y / this.tileH);
        try
        {
            if (this.weightMap[x1] == null || this.weightMap[x1][y1] == 0) return false;

        }catch(Exception e)
        {
            Debug.LogError("reachable error : " + e.Message);
        }
        return this.weightMap[x1][y1] == 1;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    private bool _checkLinePath(int x1,int y1 ,int x2,int y2)
    {
        var px = x2 - x1;
        var py = y2 - y1;
        var tile = this.tileW / 2;

        if(px == 0)
        {
            while (x1 < x2)
            {
                x1 += tile;
                if (!this.isReachable(x1, y1)) return false;
            }
            return true;
        }

        if(py == 0)
        {
            while (y1 < y2)
            {
                y1 += tile;
                if (!this.isReachable(x1, y1)) return false;
            }
        }
        //按一定比例将dis分段，用于计算线段上等比点
        var dis = Utils.Distance(x1, y1, x2, y2);
        var rx = (x2 - x1) / dis;
        var ry = (y2 - y1) / dis;
        var dx = tile * rx; //以tile大小的比例分段
        var dy = tile * ry;

        var x0 = x1;
        var y0 = y1;
        var x3 = x1 + dx;
        var y3 = y1 + dy;
        //计算在 \ / 正，反2个方向上的线段等比的点 ，是否可达，线段中间没有障碍
        while((dx > 0 && x3 < x2)|| (dx < 0 && x3 > x2))
        {
            //检测每点是否处于障碍格子内了
            if (!this._testLine(x0, y0, Mathf.FloorToInt(x3), Mathf.FloorToInt(y3))) return false;

            x0 = Mathf.FloorToInt(x3);
            y0 = Mathf.FloorToInt(y3);
            x3 += dx;
            y3 += dy;
        }

        return true;
    }

    /// <summary>
    /// 测试线段中没有障碍物
    /// </summary>
    /// <returns></returns>
    private bool _testLine(int x,int y,int x1,int y1)
    {
        if (!this.isReachable(x, y) || !this.isReachable(x1, y1)) return false;
        var dx = x1 - x;
        var dy = y1 - y;

        var tileX = Mathf.FloorToInt(x / this.tileW);
        var tileY = Mathf.FloorToInt(y / this.tileW);
        var tileX1 = Mathf.FloorToInt(x1 / this.tileW);
        var tileY1 = Mathf.FloorToInt(y1 / this.tileW);
        //直线
        if (tileX == tileX1 || tileY == tileY1) return true;
        //平行直线
        var minY = Mathf.Min(y, y1);
        var maxTileY = Mathf.Max(tileY, tileY1) * this.tileW;
        if (maxTileY - minY == 0) return true;

        var y0 = maxTileY;
        var x0 = x + dx / dy * (y0 - y); //斜率，只有直线才有斜率

        var maxTileX = Mathf.Max(tileX, tileX1) * this.tileW;
        var x3 = (x0 + maxTileX) / 2;
        var y3 = y + dy / dx * (x3 - x);
        
        if (this.isReachable(x3, y3))
        {
            return true;
        }
        return false;
    }
    
    private Vector2Int transPos(Vector2Int pos,int tileW ,int tileH)
    {
        Vector2Int newPos = Vector2Int.zero;
        newPos.x = pos.x * tileW + tileW/2;
        newPos.y = pos.y * tileH + tileH /2; 
        return newPos;
    }

    /// <summary>
    /// 压缩路径：找出不是3点成一线的点，作为转弯点
    /// </summary>
    /// <param name="tilePath"></param>
    private List<Vector2Int> compressPath2(List<Vector2Int> tilePath)
    {
        Vector2Int oldPos = tilePath[0];
        List<Vector2Int> path = new List<Vector2Int>() { oldPos };
        for(int i = 1;i< (tilePath.Count - 1); i++)
        {
            var pos = tilePath[i];
            var nextPos = tilePath[i + 1];
            //保存不共线的点，为转弯点
            if (!isLine(oldPos, pos, nextPos)) path.Add(pos);
            oldPos = pos;
            pos = nextPos;
        }

        path.Add(tilePath[tilePath.Count - 1]);
        return path;
    }
    /// <summary>
    /// 压缩路径，检测每隔2点间线路之间是否有障碍物,取2点间没障碍物的点
    /// </summary>
    /// <returns></returns>
    private List<Vector2Int> compressPath1(List<Vector2Int> path,int loopTime)
    {
        List<Vector2Int> newPath = new List<Vector2Int>() ;
        for(int k = 0; k < loopTime; k++)
        {
            Vector2Int start, end;
            newPath = new List<Vector2Int>();
            newPath.Add(path[0]);

            for (int i = 0, j = 2; j < path.Count;)
            {
                start = path[i];
                end = path[j];

                if (this._checkLinePath(start.x, start.y, end.x, end.y))
                {
                    newPath.Add(end);
                    i = j;
                    j += 2;
                }
                else
                {
                    newPath.Add(path[i + 1]);
                    i++;j++;
                }

                if(j>= path.Count)
                {
                    if ((i + 2) == path.Count) newPath.Add(path[i + 1]);
                }
            }
            path = newPath;
        }

        return newPath;
    }

    /// <summary>
    /// 判断3点共线，1，若A，B，C三点共线
    /// 最优解法是：叉积
    /// 判断 (ax-cx)*(by-cy) == (bx-cx)*(ay-cy) 即可
    /// </summary>
    /// <returns></returns>
    private bool isLine(Vector2Int p0,Vector2Int p1, Vector2Int p2)
    {
        return ((p1.x - p0.x) == (p2.x - p1.x))&& ((p1.y-p0.y) == (p2.y-p1.y));
    }
    /// <summary>
    /// 检测线段每个点之间都是可达
    /// </summary>
    /// <param name="path"></param>
    /// <returns></returns>
    private bool check(List<Vector2Int> path)
    {
        for (int i = 1; i < path.Count; i++)
        {
            var p0 = path[i - 1];
            var p1 = path[i];
            if (!this._checkLinePath(p0.x, p0.y, p1.x, p1.y))
            {
                return false;
            }
        }
        return true;
    }

    private float computeCost(List<Vector2Int> path)
    {
        float cost = 0;
        for (int i = 1; i < path.Count; i++)
        {
            var start = path[i - 1];
            var end = path[i];
            cost += Utils.Distance(start.x, start.y, end.x, end.y);
        }
        return cost;
    }

    public PathInfo _defaultPath;
    public PathInfo _compressPath2;
    public PathInfo _compressPath1;

    public PathInfo findPath(int x,int y,int x1,int y1)
    {
        if (x < 0 || x > this.width || x1 < 0 || x1 > this.width) return null;
        if (y < 0 || y > this.height || y1 < 0 || y1 > this.height) return null;

        if (!this.isReachable(x, y) || !this.isReachable(x1, y1)) return null;

        //检测2点间线段上是否有障碍区域，没有则直接返回目的坐标
        if(this._checkLinePath(x,y,x1,y1))
        {
            PathInfo p = new PathInfo();
            p.paths = new List<Vector2Int>();
            p.paths.Add(new Vector2Int(x, y));
            p.paths.Add(new Vector2Int(x1, y1));
            p.cost = Utils.Distance(x, y, x1, y1);
            Debug.Log(" the line path is very good,no obstacle");
            return p;
        }

        var tx1 = Mathf.FloorToInt(x / this.tileW);
        var ty1 = Mathf.FloorToInt(y / this.tileH);
        var tx2 = Mathf.FloorToInt(x1 / this.tileW);
        var ty2 = Mathf.FloorToInt(y1 / this.tileH);

        var path = this.pfinder.finder(tx1, ty1, tx2, ty2, this);
        if(path == null || path.paths == null)
        {
            Debug.LogError("can not find path");
            return null;
        }
        _defaultPath = path;

        //把格子下标转换为物理坐标
        List<Vector2Int> paths = new List<Vector2Int>();
        paths.Add(new Vector2Int(x, y));
        for (int i = 1; i < path.paths.Count; i++)
        {
            paths.Add(transPos(path.paths[i], this.tileW, this.tileH));
        }
        paths.Add(new Vector2Int(x1, y1));
        //1，先找出路径上转弯的节点
        paths = this.compressPath2(paths);
        _compressPath2 = new PathInfo() { paths = paths, cost = 0 };
        if(paths.Count > 2)
        {
            //2,找出起点到每个转弯节点处的最优直线节点，线段之间没有障碍物的节点
            paths = this.compressPath1(paths, 3);
            //3,再次踢除多余的直线节点，只保留转弯节点
            paths = this.compressPath2(paths);
            _compressPath1 = new PathInfo() { paths = paths, cost = 0 };
            if (!this.check(paths))
            {
                Debug.LogError("illegal path!!!");
                return null;
            }
        }
        PathInfo result = new PathInfo()
        {
            paths = paths,
            cost = this.computeCost(paths)
        };


        return result;
    }


    public void stopMove()
    {
        this.node.transform.DOKill();
        if (standTW != null) standTW.Kill();
        standTW = null;
    }
    private Player getCurPlayer()
    {
        return (Player)App.Inst.getArea().getCurPlayer();
    }
    public void moveBackground(Vector2Int sdist,float time)
    {
        if (this.node == null) return;
        this._checkPosition(sdist, time);
    }

    /// <summary>
    /// 检查人物，地图坐标和边界，确认是否地图可以移动
    /// </summary>
    /// <param name="sdist"></param>
    /// <param name="time"></param>
    /// <param name="osx">记录的上一次x移动的状态</param>
    /// <param name="osy"></param>
    /// <param name="isframe">帧上调用的标志</param>
    private void _checkPosition(Vector2Int sdist,float time,bool osx=false,bool osy = false,bool isframe = false)
    {
        var mpos = this.getPosition();
        var curpos = getCurPlayer().getSprite().getPosition();
        var spos = new Vector2Int(Mathf.FloorToInt(curpos.x), Mathf.FloorToInt(curpos.y));

        var dx = spos.x - sdist.x;
        var dy = spos.y - sdist.y;

        var sx = shouldMoveX(spos, mpos, dx, this.width);
        var sy = shouldMoveY(spos, mpos, dy, this.height);

        //和上次状态一样，则不改变，避免每帧移动修改逻辑。
        if (osx == sx && osy == sy && isframe)
        {
            return;
        }

        if (sx && sy)
        {
            this._moveAll(dx, dy, time, sdist);
            return;
        }
        //在地图4个角落时，每帧等待地图是否可移动状态。
        if (!sx && !sy)
        {
            this._stand(time, sdist);
            return;
        }

        if (sx)
        {
            this._moveX(dx, time, sdist);
            return;
        }

        this._moveY(dy, time, sdist);
    }
    /// <summary>
    /// 检查地图是否应该沿x方向移动。
    /// 条件1：
    ///     地图是否处于屏幕左/右边沿
    /// 条件2：
    ///     当地图处于屏幕左边沿时，人物是否也处于屏幕左半部分?是的话，地图原地每帧等待人物移动出左半部分区域，再次移动
    ///     同理，地图处于右边沿时，判断人物是否处于屏幕右半部分，是，则每帧等待人物移出右半区域，再移动。
    ///     这样就可以实现，人物在边界自由移动，而地图不动
    /// </summary>
    /// <param name="spritePos"></param>
    /// <param name="mapPos"></param>
    /// <param name="dx">正数：地图向右移动，负数：地图向左移动</param>
    /// <param name="mapWidth"></param>
    /// <returns></returns>
    private bool shouldMoveX(Vector2Int spritePos,Vector2Int mapPos,int dx,int mapWidth)
    {
        //地图是否已靠边
        var cx = canMoveX(mapPos, dx, mapWidth);
   
        if (!cx) return false;

        if(dx > 0)
        {
            var sr = spriteInRight(spritePos, mapPos);
           
            return !sr;
        }
        else
        {
            var sl = spriteInLeft(spritePos, mapPos);
           
            return !sl;
        }
    }
    /// <summary>
    /// 原理和移动x一样的条件判断
    /// </summary>
    /// <param name="spritePos"></param>
    /// <param name="mapPos"></param>
    /// <param name="dy"></param>
    /// <param name="mapheight"></param>
    /// <returns></returns>
    private bool shouldMoveY(Vector2Int spritePos, Vector2Int mapPos, int dy, int mapheight)
    {
        var cy = canMoveY(mapPos, dy, mapheight);
        if (!cy) return false;
        if(dy < 0)
        {
            var sb = spriteInBottom(spritePos, mapPos);
            return !sb;
        }
        else
        {
            var st= spriteInTop(spritePos, mapPos);
            return !st;
        }
    }

    private bool canMoveX(Vector2 pos,int dx , int width)
    {
        if (dx == 0) return false;
        if(dx > 0) //地图往右移动时，检测是否地图已处于屏幕最左边界
        {
            return !mapInLeft(pos, Utils.ScreenWidth);
        }
        return !mapInRight(pos,width,Utils.ScreenWidth);
    }

    private bool canMoveY(Vector2 pos,int dy,int height)
    {
        if (dy == 0) return false;
        if(dy < 0)
        {
            return !mapInTop(pos, Utils.ScreenHeight);
        }
        return !mapInBottom(pos, height, Utils.ScreenHeight);
    }


    private bool mapInLeft(Vector2 mapPos,int screenWidth)
    {
        return mapPos.x + screenWidth /2 >= -10;
    }
    /// <summary>
    /// 原理：以左上角(0,0)为坐标原点，地图左上角(0,0) ，右上角(mapWidth,0),屏幕右上角(screenWidth,0)
    /// 当地图右上角-屏幕右上角的间距<=10时，说明地图右边靠近屏幕最右边。
    /// 这里地图左上角坐标为屏幕宽高的一半为原点。
    /// 因camera的中心为原点，所以屏幕右边坐标(w/2,h/2)
    /// </summary>
    /// <returns></returns>
    private bool mapInRight(Vector2 mapPos,int mapWidth,int screenWidth)
    {
        return (mapWidth + mapPos.x - screenWidth /2) <= 10;
    }
    /// <summary>
    /// 计算地图最左下角坐标和屏幕底部坐标的间距
    /// </summary>
    /// <returns></returns>
    private bool mapInBottom(Vector2 mapPos,int mapHeight,int screenHeight)
    {
        return ( mapPos.y - mapHeight  + screenHeight/2) >= -10;
    }
    /// <summary>
    /// 计算地图顶部坐标和屏蔽顶部坐标的间距
    /// </summary>
    /// <returns></returns>
    private bool mapInTop(Vector2 mapPos,int screenHeight)
    {
        return mapPos.y - screenHeight / 2 <= 10;
    }
    /// <summary>
    /// 计算sprite的世界坐标在原点的上下方向，
    /// </summary>
    /// <param name="spritePos"></param>
    /// <param name="mapPos"></param>
    /// <returns></returns>
    private bool spriteInTop(Vector2Int spritePos,Vector2Int mapPos)
    {
        return spritePos.y + mapPos.y > 0;//地图左上角为轴心点
    }

    private bool spriteInBottom(Vector2Int spritePos, Vector2Int mapPos)
    {
        return spritePos.y + mapPos.y < 0;
    }

    private bool spriteInLeft(Vector2Int spritePos, Vector2Int mapPos)
    {
        return (spritePos.x + mapPos.x) < 0;
    }

    private bool spriteInRight(Vector2Int spritePos, Vector2Int mapPos)
    {
        return spritePos.x + mapPos.x > 0;
    }


    private void _moveAll(int dx,int dy, float time,Vector2Int sdist)
    {
        this.stopMove();
        var position = this.getPosition();
        var ex = position.x + dx;
        var ey = position.y + dy;

        this._move(ex, ey, time, (dt) => {
            this._checkPosition(sdist, time - dt, true, true,true);
        });

    }

    private void _move(int ex,int ey,float time,Action<float> cb)
    {
       // long startTime = Utils.ConvertDateTimeInt(DateTime.Now);
        if (this.node != null)
        {
            var tween = this.node.transform.DOLocalMove(new Vector3Int(ex, ey, -1), time * 0.001f).SetEase(Ease.Linear);
            tween.onUpdate = () => {
                cb.Invoke(tween.Elapsed()* 1000);
            };
            
        }

    }
    Tween standTW = null;
    private void _stand(float time ,Vector2Int sdist)
    {
        this.stopMove();
        var mpos = this.getPosition();

        this._move(mpos.x, mpos.y, time, (dt) =>
        {
            this._checkPosition(sdist, time - dt, false, false,true);
        });
        int tmp = 0;

        standTW = DOTween.To(() => tmp, (x) => { tmp = x; }, 0, time * 0.001f).SetEase(Ease.Linear);
        standTW.onUpdate = () =>
        {
            this._checkPosition(sdist, time - standTW.Elapsed() * 1000, false, false, true);
        };
    }

    private void _moveX(int dx,float time,Vector2Int sdist)
    {
        this.stopMove();
        var pos = this.getPosition();
        var ex = pos.x + dx;
        var ey = pos.y;
        this._move(ex, ey, time, (dt) =>
        {
            this._checkPosition(sdist, time - dt, true, false,true);
        });
    }

    private void _moveY(int dy, float time, Vector2Int sdist)
    {
        this.stopMove();
        var pos = this.getPosition();
        var ex = pos.x ;
        var ey = pos.y + dy;
        this._move(ex, ey, time, (dt) =>
        {
            this._checkPosition(sdist, time - dt, false, true,true);
        });
    }
    /// <summary>
    /// 画地图障碍物
    /// </summary>
    private void DrawMapTile()
    {
        GameObject tileroot = new GameObject("tilenode");
        tileroot.transform.parent = this.node.transform;
        GameObject tile = Resources.Load<GameObject>("map/tile");
        //左上角为原点
        Vector3 pos = this.node.transform.position;
        Vector3 center = new Vector3(pos.x + this.tileW * 0.5f, pos.y - this.tileH * 0.5f, 0);

        for (int x = 0; x < this.weightMap.Length; x++)
        {
            for (int y = 0; y < this.weightMap[x].Length; y++)
            {
                int state = this.weightMap[x][y];
                if (state == 1) continue;
                GameObject obj = MonoBehaviour.Instantiate(tile,tileroot.transform) as GameObject;
                obj.transform.localPosition = new Vector3(center.x + x * this.tileW, center.y - y * this.tileH, 0);
            }
        }
    }
}
