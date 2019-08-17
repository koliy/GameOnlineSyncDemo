using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
/// <summary>
/// 用于对List 和Dictionary的JSON直接序列化存储.
/// </summary>

[Serializable]
public class Serialization<T>
{
    [SerializeField]
    List<T> target;
    public List<T> ToList() { return target; }
    public Serialization(List<T> target)
    {
        this.target = target;
    }
}

[Serializable]
public class Serialization<TKey, TValue> : ISerializationCallbackReceiver
{
    [SerializeField]
    List<TKey> keys;
    [SerializeField]
    List<TValue> values;

    Dictionary<TKey, TValue> target;
    public Dictionary<TKey,TValue> ToDictionary() { return target; }

    public Serialization(Dictionary<TKey,TValue> target)
    {
        this.target = target;
        keys = new List<TKey>();
        values = new List<TValue>();
    }

    public void OnBeforeSerialize()
    {
        keys.Clear();
        values.Clear();
        foreach (var kvp in target)
        {
            keys.Add(kvp.Key);
            values.Add(kvp.Value);
        }
    }

    public void OnAfterDeserialize()
    {
        var count = Math.Min(keys.Count, values.Count);
        target = new Dictionary<TKey, TValue>();
        for(var i = 0; i < count; ++i)
        {
            target.Add(keys[i], values[i]);
        }
    }
}
