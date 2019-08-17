using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CursorServer
{
    private Texture2D atkTexture, defaultTexture,talkTexture;
    private CursorMode cursorMode = CursorMode.Auto;
    private Vector2 hotSpot = Vector2.zero;

    public CursorServer()
    {
        atkTexture = Resources.Load<Texture2D>("cursor/cursor_atk");
        defaultTexture = Resources.Load<Texture2D>("cursor/cursor_default");
        talkTexture = Resources.Load<Texture2D>("cursor/cursor_talk");
    }

    public void OnMouseEnter(bool isMob)
    {
        if(isMob) Cursor.SetCursor(atkTexture, hotSpot, cursorMode);
        else Cursor.SetCursor(talkTexture, hotSpot, cursorMode);
    }

    public void OnMouseExit()
    {
        Cursor.SetCursor(defaultTexture, Vector2.zero, cursorMode);
    }

}
