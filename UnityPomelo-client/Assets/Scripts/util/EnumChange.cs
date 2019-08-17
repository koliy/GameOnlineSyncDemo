using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnumChange<T> 
{
    public static string EnumToString(T _enumType)
    {
        return Enum.GetName(typeof(T), _enumType);
    }

    public static T StringToEnum(string _value)
    {
        return (T)Enum.Parse(typeof(T), _value);
    }
}
