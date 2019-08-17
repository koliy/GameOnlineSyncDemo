using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SceneServer : MonoBehaviour
{

    // Update is called once per frame
    void Update()
    {
        App.Inst.area.actionManager.update();
    }


}
