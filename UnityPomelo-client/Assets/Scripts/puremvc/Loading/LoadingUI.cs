using SimpleJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LoadingUI : MonoBehaviour
{
    private Text txtValue;
    private Slider processbar;
    private int totalCount;
    private int loadedCount;
   
    // Start is called before the first frame update
    void Awake()
    {
        txtValue = transform.Find("ProcessBar/Text").GetComponent<Text>();
        processbar = transform.Find("ProcessBar").GetComponent<Slider>();
    }

    public void InitUI(bool opt =true)
    {
        txtValue.text = "0%";
        processbar.maxValue = 100;
        processbar.minValue = 0;
        processbar.value = 0;
        totalCount = 0;
        loadedCount = 0;
        
    }

    public void SetTotalCount(int totalcount)
    {
        totalCount = totalcount;
        processbar.maxValue = totalcount;
    }

    public void SetLoadedCount(int count)
    {
        loadedCount += count;
        processbar.value = loadedCount;
        txtValue.text =  Mathf.CeilToInt((processbar.value / processbar.maxValue)*100) + "%";
        if (loadedCount == this.totalCount)
        {
            Debug.Log("Load Complete...");
            txtValue.text = "100%";
        }
    }



    public void UpdateValue(int totalcount,int loadedcount)
    {

    }


    public void LoadMap(string name)
    {
       //有地图图片的话，则加载一次到内存
       // SceneManager.LoadScene(name, LoadSceneMode.Additive);

        //SceneManager.sceneLoaded += onLoadingComplete;
        //StartCoroutine(LoadAsyncScene());

        SetLoadedCount(1);
    }

    public void LoadCharacter(SimpleJSON.JSONArray ids,string types)
    {
        if (ids == null || ids.Count == 0) return;
        //有角色图片则加载一次到内存
        for (int i =0;i<ids.Count;i++)
        {
            SimpleJSON.JSONNode p = ids[i];
            string filepath = types + "/" + p.AsInt;
           // Debug.Log(filepath);
            GameObject obj = (GameObject)Instantiate(Resources.Load(filepath));
            SetLoadedCount(1);
            //SceneManager.MoveGameObjectToScene(obj, SceneManager.GetSceneByName("desert"));
        }
    }



    public void LoadNpc(SimpleJSON.JSONArray ids)
    {
        if (ids == null || ids.Count == 0) return;
        for (int i = 0; i < ids.Count; i++)
        {
            SimpleJSON.JSONNode p = ids[i];
            string filepath = "npc/" + p.AsInt;
           // Debug.Log(filepath);
            GameObject obj = (GameObject)Instantiate(Resources.Load(filepath));
            SetLoadedCount(1);
           // SceneManager.MoveGameObjectToScene(obj, SceneManager.GetSceneByName("desert"));
        }
    }

    public void LoadItem(SimpleJSON.JSONArray ids)
    {
        if (ids == null || ids.Count == 0) return;
        var items = DataApi.Inst.item.All();
        for (int i = 0; i < ids.Count; i++)
        {
            SimpleJSON.JSONNode p = ids[i];
           
            int id = p.AsInt;
            
            JsonObject item = items[id.ToString()] as JsonObject;

            string filepath = "item/item_" + Convert.ToInt32(item["imgId"]);
            Resources.Load(filepath,typeof(Sprite));
            SetLoadedCount(1);
            //SceneManager.MoveGameObjectToScene(obj, SceneManager.GetSceneByName("desert"));
        }
    }

    public void LoadEquipment(SimpleJSON.JSONArray ids)
    {
        if (ids == null || ids.Count == 0) return;
        var items = DataApi.Inst.equipment.All();
        for (int i = 0; i < ids.Count; i++)
        {
            SimpleJSON.JSONNode p = ids[i];
            JsonObject item = items[p.ToString()] as JsonObject;

            string filepath = "equipment/item_" + Convert.ToInt32(item["imgId"]);
            Debug.Log(filepath);
            //GameObject obj = (GameObject)Instantiate(Resources.Load(filepath));
            //SetLoadedCount(1);
            //SceneManager.MoveGameObjectToScene(obj, SceneManager.GetSceneByName("desert"));
        }
    }

    //IEnumerator LoadAsyncScene()
    //{
    //    AsyncOperation asyncload = SceneManager.LoadSceneAsync("desert", LoadSceneMode.Additive);
    //    while (!asyncload.isDone)
    //    {
    //        yield return new WaitForEndOfFrame();
    //    }
    //}

    //private void onLoadingComplete(Scene scene, LoadSceneMode mode)
    //{
    //    Debug.Log("OnSceneLoaded: " + scene.name);
    //    Debug.Log(mode);
    //    SceneManager.sceneLoaded -= onLoadingComplete;

    //    //AppFacade.Instance.SendNotification(LoadingNotify.Open, true);

    //}


    public void InitObjectPools(SimpleJSON.JSONArray ids,string types)
    {
        if (ids == null || ids.Count == 0) return;

        var of = new ObjectPoolFactory();
        for(int i = 0; i < ids.Count; i++)
        {
            SimpleJSON.JSONNode p = ids[i];
            int kindId = p.AsInt;

            string poolname = Utils.getPoolName(kindId, types);
            var pool = App.Inst.getObjectPoolManage().getPool(poolname);
            if (pool == null)
            {
                of.createPools(kindId, types);
            }
        }



    }
}
