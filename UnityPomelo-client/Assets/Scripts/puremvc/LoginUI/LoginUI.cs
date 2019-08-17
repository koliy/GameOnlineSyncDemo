using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using Pomelo.DotNetClient;
using SimpleJson;
using System;
using UnityEngine.SceneManagement;

public class LoginUI : MonoBehaviour
{
    private const string host = "127.0.0.1";
    private const int port = 3014;
    private PomeloSocket pclient;

    private InputField txtName,txtPs;
    private Button btnLogin,btnRegister;
    public RoleUI roleui;

    // Start is called before the first frame update
    void Awake()
    {
        txtName = transform.Find("txtName").GetComponent<InputField>();
        txtPs = transform.Find("txtPs").GetComponent<InputField>();
        btnLogin = transform.Find("btnLogin").GetComponent<Button>();
        btnLogin.onClick.AddListener(OnLogin);
  
    }

    private void OnLogin()
    {
        pclient = PomeloSocket.Inst.InitClient(host, port, (data) =>
        {
            Debug.Log("Connect gate server success!");
            JsonObject msg = new JsonObject();
            msg["uid"] = txtName.text;
            pclient.Request("gate.gateHandler.enter", msg, OnQuery);
        });
       
    }

    void OnQuery(JsonObject result)
    {
        Debug.Log(result);
        if (Convert.ToInt32(result["code"]) == 200)
        {
            pclient.Disconnect();
            string host = (string)result["host"];
            int port = Convert.ToInt32(result["port"]);

            pclient = PomeloSocket.Inst.InitClient(host, port, (data) =>
            {
                Debug.Log("Connect gate server success!");
                Enter();
            });

        }
    }


    void Enter()
    {
        if (pclient != null)
        {

            string key = "ae125efkk4454eeff444ferfkny6oxi8";
            long curtime = Utils.ConvertDateTimeInt(DateTime.Now);
            string token =  Token.Create(txtName.text, curtime.ToString(), key);

            JsonObject userMessage = new JsonObject();
            userMessage["username"]= txtName.text;
            userMessage["password"]=txtPs.text;
            userMessage["token"] = token;
            pclient.Request("connector.entryHandler.entry", userMessage, (data) => {
                Debug.Log(data);
                Int64 code = (Int64)data["code"];
               
                if (code == 500)
                {
                    Debug.Log("密码错误");
                    return;
                }

                if (code != 200)
                {
                    Debug.Log("帐号token失效");
                    return;
                }

                if (code == 200)
                {
                    Debug.Log("登陆成功");
                    //注册服务器端监听事件
                    LoginMsgHandler.Inst.Init();
                    GameMsgHandler.Inst.Init();

                    object player;
                    bool isok = data.TryGetValue("player", out player);
                    
                    if (isok)
                    {
                        Debug.Log(player);
                        JsonObject _player = player as JsonObject;
                        int _id = Convert.ToInt32(_player["id"]);
                        if (_id > 0) AfterLogin(data);
                    } 
                    else
                    {
                        AppFacade.Instance.SendNotification(LoginNotify.ShowRole);
                    }
                    return;
                }

            });
        }
    }



    public void ShowRoleUI()
    {
        roleui.gameObject.SetActive(true);
    }


    private void AfterLogin(JsonObject data)
    {
        object userData,playerData;
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
            DataManager.Inst.pomelodata.playerId =  Convert.ToInt32(_player["id"]);
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
        AsyncOperation asyncload = SceneManager.LoadSceneAsync("Loading",LoadSceneMode.Single);
        while (!asyncload.isDone)
        {
            yield return new WaitForEndOfFrame();
        }
    }

    private void onLoadingComplete(Scene scene, LoadSceneMode mode)
    {
        Debug.Log("OnSceneLoaded: " + scene.name);
        AppFacade.Instance.SendNotification(LoadingNotify.Open,true);
        SceneManager.sceneLoaded -= onLoadingComplete;
    }
}
