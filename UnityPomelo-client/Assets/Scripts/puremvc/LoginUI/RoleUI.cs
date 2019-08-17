using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using SimpleJson;
using System;
using UnityEngine.SceneManagement;

public class RoleUI : MonoBehaviour
{
    private Text txtname;
    private Toggle tapbaby,tapgril; 
    private string[] namegroups;
    private uint roleId = 210;

    // Start is called before the first frame update
    void Awake()
    {
        txtname = transform.Find("txtName").GetComponent<Text>();
        Button btnEnter = transform.Find("btnEnter").GetComponent<Button>();
        btnEnter.onClick.AddListener(OnEnterGame);
        Button btnName = transform.Find("btnRandomName").GetComponent<Button>();
        btnName.onClick.AddListener(OnRandomName);
        tapbaby = transform.Find("tapGroup/tapBaby").GetComponent<Toggle>();
        tapgril = transform.Find("tapGroup/tapGril").GetComponent<Toggle>();


        Init();
    }

    private void Init()
    {
        namegroups = new string[] { "小号1" , "小号2" , "小号3" , "小号4" , "小号5" , "小号6" };

    }

    private void OnEnterGame()
    {
        if (tapbaby.isOn)
        {
            Debug.Log("baby is select");
            roleId = 210;
        }

        if (tapgril.isOn)
        {
            Debug.Log("gril is select");
            roleId = 211;
        }

        JsonObject playerdata = new JsonObject();
        playerdata["name"] = txtname.text;
        playerdata["roleId"] = roleId;

        PomeloSocket.Inst.Request("connector.roleHandler.createPlayer", playerdata,(data)=>
        {
            Debug.Log(data);
            Int64 code = (Int64)data["code"];
            if (code == 500)
            {
                Debug.Log("角色名已存在");
                return;
            }

            object player;
            bool isok = data.TryGetValue("player", out player);
            if (isok)
            {
                JsonObject _player = player as JsonObject;
                int _id = Convert.ToInt32(_player["id"]);
                if (_id > 0) AfterLogin(data);
            }
        });
    }


    private void OnRandomName()
    {
        txtname.text = namegroups[ UnityEngine.Random.Range(0, namegroups.Length -1)];
        txtname.text += UnityEngine.Random.Range(1, 10000);
    }


    private void AfterLogin(JsonObject data)
    {
        object userData, playerData;
        bool isok = data.TryGetValue("player", out playerData);
        bool isok2 = data.TryGetValue("user", out userData);
        if (isok)
        {
            JsonObject _player = playerData as JsonObject;
            if (isok2)
            {
                JsonObject _userdata = userData as JsonObject;
                DataManager.Inst.pomelodata.uid = Convert.ToInt32(_userdata["id"]);
            }
            DataManager.Inst.pomelodata.playerId = Convert.ToInt32(_player["id"]);
            DataManager.Inst.pomelodata.areaId = Convert.ToInt32(_player["areaId"]);
            DataManager.Inst.pomelodata.playerjsondata = _player;
   
            LoadResoucrce();
        }

    }

    private void LoadResoucrce()
    {
        SceneManager.sceneLoaded += onLoadingComplete;
        StartCoroutine(LoadAsyncScene());
    }

    IEnumerator LoadAsyncScene()
    {
        AsyncOperation asyncload = SceneManager.LoadSceneAsync("Loading", LoadSceneMode.Single);
        while (!asyncload.isDone)
        {
            yield return new WaitForEndOfFrame();
        }
    }

    private void onLoadingComplete(Scene scene, LoadSceneMode mode)
    {
        Debug.Log("OnSceneLoaded: " + scene.name);
        AppFacade.Instance.SendNotification(LoadingNotify.Open, true);
        SceneManager.sceneLoaded -= onLoadingComplete;
    }
}
