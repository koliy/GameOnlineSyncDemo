using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Consts 
{
    public enum EntityType
    {
         player,
         npc,
         mob,
         equipment,
         item
    }
   
    public enum AttackResult
    {
        SUCCESS=1,
        KILLED =2,
        MISS=3,
        NOT_IN_RANGE= 4,
        NO_ENOUGH_MP= 5,
        NOT_COOLDOWN=6,
        ATTACKER_CONFUSED= 7
      }
}
