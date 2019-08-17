using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class Utils 
{
    /// <summary>
    /// 时间戳转为C#格式时间
    /// </summary>
    /// <param name=”timeStamp”></param>
    /// <returns></returns>
    public static DateTime GetTime(string timeStamp)
    {
        DateTime dtStart = TimeZone.CurrentTimeZone.ToLocalTime(new DateTime(1970, 1, 1,1,1,1,1));
        long lTime = long.Parse(timeStamp + "0000"); //"000000" :秒
        TimeSpan toNow = new TimeSpan(lTime);
        return dtStart.Add(toNow);
    }


    /// <summary>
    /// DateTime时间格式转换为Unix时间戳格式
    /// </summary>
    /// <param name=”time”></param>
    /// <returns></returns>
    public static long ConvertDateTimeInt(System.DateTime time)
    {
        System.DateTime startTime = TimeZone.CurrentTimeZone.ToLocalTime(new System.DateTime(1970, 1, 1, 1, 1, 1, 1));
        return (long)(time - startTime).TotalMilliseconds;
    }


    public static string CalculateDirection(Vector2 start, Vector2 end)
    {
        return "RightDown";
    }

    public static string getPoolName(int kindId,string name)
    {
        return kindId + "_" + name;
    }

    public static int ScreenWidth
    {
        get {
            //不同分辨率下的显示宽高
            float ratio = Screen.width * 1f / Screen.height;
            float size = Camera.main.orthographicSize;//UI以固定高度为主
            var width = Mathf.RoundToInt(ratio * size) * 2;
            return width;
        }
    }

    public static int ScreenHeight
    {
        get
        {
            return Mathf.RoundToInt(Camera.main.orthographicSize) * 2;
        }
    }

    /**
     * 利用hashtable生成完美的随机数，而不是在for时，一瞬间出现0，0，1等
     */ 
    public static Hashtable RandomInt(int maxvalue)
    {
        Hashtable hashtable = new Hashtable();
        System.Random rm = new System.Random();
        int RmNum = maxvalue;
        for (int i = 0; hashtable.Count < RmNum; i++)
        {
            int nValue = rm.Next(maxvalue);
            if (!hashtable.ContainsValue(nValue))
            {
                hashtable.Add(i, nValue);    //Add(key,value)
            }
        }
        return hashtable;
    }

    public static float Distance(int x1,int y1,int x2,int y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Mathf.Sqrt(dx * dx + dy * dy);
    }

    public static float totalDistance(List<Vector2Int> paths)
    {
        if (paths == null || paths.Count < 2) return 0;
        float distance = 0;
        for(int i=0,maxi = paths.Count - 1; i < maxi; i++)
        {
            distance += Distance(paths[i].x, paths[i].y, paths[i + 1].x, paths[i + 1].y);
        }
        return distance;
    }


}
