using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.U2D;
using UnityEngine.UI;

public class Test : MonoBehaviour
{


    public Button btn1,btn2;
  
    // Start is called before the first frame update
    void Start()
    {

        //  btn1.onClick.AddListener(Test1);

        SpriteAtlas atlas =Instantiate< SpriteAtlas>(Resources.Load<SpriteAtlas>("SpriteAtlas/UIAtlas")) as SpriteAtlas;
        
        GameObject go = new GameObject();
        Sprite sp = atlas.GetSprite("gongyong_005");
        go.AddComponent<SpriteRenderer>().sprite = sp;
    }


    private void Test1()
    {
        System.Diagnostics.Stopwatch stopwatch = new System.Diagnostics.Stopwatch();


        PriorityQueue<int> q = new PriorityQueue<int>();

        int[] a = new int[] { 78, 99, 10, 22, 10, 5, 4, 6, 55, 102 };
        stopwatch.Start();
        foreach (int prop in a) q.Push(prop);

        stopwatch.Stop();
        //获取当前实例测量得出的总时间        
        System.TimeSpan timespan = stopwatch.Elapsed;
        double milliseconds = timespan.TotalMilliseconds;  //  总毫秒数   
        Debug.Log("run time:" + milliseconds);
        Debug.Log(q.ToString());

        stopwatch.Start();
        q.Pop();
        stopwatch.Stop();
        timespan = stopwatch.Elapsed;
        milliseconds = timespan.TotalMilliseconds;  //  总毫秒数   
        Debug.Log("pop time:" + milliseconds);
        
        while(q.Count > 0)
        {
            Debug.Log(q.Pop());
        }
        Debug.Log("====================");


    }
    




}
