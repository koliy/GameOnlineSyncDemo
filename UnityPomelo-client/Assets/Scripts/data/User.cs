using SimpleJson;
using System.Collections;
using System.Collections.Generic;

[System.Serializable]
public class User 
{
    public int id;
    public string name;
    public string password;
}

public class PomeloData
{
    public int uid;
    public int playerId;
    public int areaId;
    public JsonObject playerjsondata;
}

//public class PlayerData
//{
//    public int id { get; set; }
//    public int entityId { get; set; }
//    public string name { get; set; }
//    public int kindId { get; set; }
//    public string kindName { get; set; }
//    public string type { get; set; }
//    public int x { get; set; }
//    public int y { get; set; }
//    public int hp { get; set; }
//    public int mp { get; set; }
//    public int maxHp { get; set; }
//    public int maxMap { get; set; }
//    public int level { get; set; }

//    public int areaId { get; set; }
//    public int range { get; set; }
//    public int teamId { get; set; }
//    public long experience { get; set; }
//    public int attackValue { get; set; }
//    public int defenceValue { get; set; }
//    public int walkSpeed { get; set; }
//    public int attackSpeed { get; set; }
//    public int hitRate { get; set; }
//    public int dodgeRate { get; set; }
//    public long nextLevelExp { get; set; }
//    public int skillPoint { get; set; }
//    public int isCaptain { get; set; }
//}
[System.Serializable]
public class EntityData
{
    public int id;
    public int entityId;
    public string name;
    public string englishName;
    public int kindId;
    public string kindName;
    public int kindType;
    public string type;
    public int x;
    public int y;
}
[System.Serializable]
public class PlayerData: EntityData
{
    //public int id;
    //public int entityId;
    //public string name;
    //public int kindId;
    //public string kindName;
    //public string type;
    //public int x;
    //public int y;
    public int hp;
    public int mp;
    public int maxHp;
    public int maxMap;
    public int level;

    public int areaId;
    public int range;
    public int teamId;
    public long experience;
    public int attackValue;
    public int defenceValue;
    public int walkSpeed;
    public int attackSpeed;
    public int hitRate;
    public int dodgeRate;
    public long nextLevelExp;
    public int skillPoint;
    public int isCaptain;
}
[System.Serializable]
public class ItemData: EntityData
{
    public string desc;
    public int kind;
    public int hp;
    public int mp;
    public int price;
    public int heroLevel;
    public int imgId;
}
