using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Security.Cryptography;
using System.Text;
using System;

public class Token
{
    public static string Create(string uid,string timestampe,string pwd)
    {
        string msg = uid + '|' + timestampe;
        
        byte[] keyArray = UTF8Encoding.UTF8.GetBytes(pwd);
        byte[] toEncryArray = UTF8Encoding.UTF8.GetBytes(msg);
        RijndaelManaged rDel = new RijndaelManaged();
        rDel.Key = keyArray;
        rDel.Mode = CipherMode.ECB;
        rDel.Padding = PaddingMode.PKCS7;
        ICryptoTransform cTransform = rDel.CreateEncryptor();
        byte[] resultArray = cTransform.TransformFinalBlock(toEncryArray, 0, toEncryArray.Length);
        
        return Convert.ToBase64String(resultArray,0,resultArray.Length);
    }

    // <summary>
    /// AES解密
    /// </summary>
    /// <param name="decryptStr">密文</param>
    /// <param name="key">密钥</param>
    /// <returns></returns>
    public static string Parse(string token, string pwd)
    {
        byte[] keyArray = UTF8Encoding.UTF8.GetBytes(pwd);
        byte[] toEncryptArray = Convert.FromBase64String(token);
        RijndaelManaged rDel = new RijndaelManaged();
        rDel.Key = keyArray;
        rDel.Mode = CipherMode.ECB;
        rDel.Padding = PaddingMode.PKCS7;
        ICryptoTransform cTransform = rDel.CreateDecryptor();
        byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
        return UTF8Encoding.UTF8.GetString(resultArray);
    }
}
