using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class HubBarUI : MonoBehaviour
{
    private RectTransform mtransform;
    private Slider sliderbar;
    public Transform mtarget;
    public Vector3 offset;
    private float curTime = 0;
    // Start is called before the first frame update
    void Awake()
    {
        curTime = 10;
        mtransform = GetComponent<RectTransform>();
        sliderbar = GetComponent<Slider>();
       // mtransform.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Left, 0, 0);
    }

    // Update is called once per frame
    void LateUpdate()
    {
        if (mtarget == null) return;

        Vector3 pos = mtarget.TransformPoint(offset);
        Vector2 sceenpos = Camera.main.WorldToScreenPoint(pos);
        mtransform.position = sceenpos;
    }

    public void Clear()
    {
        mtarget = null;

    }

    public void SetDefaultValue(int value,int maxValue)
    {
        sliderbar.minValue = 0;
        sliderbar.maxValue = maxValue;
       // sliderbar.value = value;
        sliderbar.SetValueWithoutNotify(value);

    }

    public void UpdateValue(float value)
    {
       // sliderbar.DOValue(value, 0.1f, true);
        sliderbar.value = value;
    }
}
