using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LaunchUI : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Application.runInBackground = true;
        AppFacade.Instance.StartUp();
    
    }


}
