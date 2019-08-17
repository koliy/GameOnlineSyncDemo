using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GameUI : MonoBehaviour
{
    public GameObject waitPanel;
    public GameObject talkPanel;
    private Button btnTalk;

    // Start is called before the first frame update
    void Awake()
    {

    }

    public void InitUI()
    {
        btnTalk = talkPanel.transform.Find("btnOk").GetComponent<Button>();
    }

    public void InitButton(string btnname,UnityAction cb)
    {
        switch (btnname)
        {
            case "btnOk":
                {
                    btnTalk.onClick.AddListener(cb);
                    break;
                }
        }
    }

    public void ShowWaitUI(bool isShow)
    {
        if (waitPanel != null)
        {
            waitPanel.SetActive(isShow);
            this.transform.SetAsLastSibling();

        }
    }

    public void ShowTalkUI(bool isShow)
    {
        if (talkPanel != null)
        {
            talkPanel.SetActive(isShow);
            this.transform.SetAsLastSibling();
        }
    }

    public void InitTalkUI(TalkData talkdata)
    {
        if (talkPanel != null)
        {
            Text txtName = talkPanel.transform.Find("txtName").GetComponent<Text>();
            Text txtMsg = talkPanel.transform.Find("txtMsg").GetComponent<Text>();
            txtName.text = talkdata.name;
            txtMsg.text = talkdata.msg;
        }
    }




    public void LoadResoucrce()
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
        AppFacade.Instance.SendNotification(LoadingNotify.Open, false);//新场景不更新json文件数据
        SceneManager.sceneLoaded -= onLoadingComplete;
    }
}
