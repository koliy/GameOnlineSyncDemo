using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;

/**
 *
 * 从CLR的角度来看，首先数组是引用类型，堆栈分配属于分配于堆上，
 * 其次数组在内存中是连续的存储的，所以索引速度很快，而且赋值与修改元素也很简单。
 * 可以利用偏移地址访问元素，时间复杂度为O(1);可以用折半查找法查找元素，效率高。
 * @param cmpPriority
 * @returns {{arr: any[]}}
 */
public class PriorityQueue<T> 
{
    IComparer<T> comparer;
    T[] heap;
    public int Count { get; private set; }
    public PriorityQueue() : this(null) { }
    public PriorityQueue(int capacity) : this(capacity,null) { }
    public PriorityQueue(IComparer<T> comparer) : this(16, comparer) { }

    public PriorityQueue(int capacity,IComparer<T> comparer)
    {
        this.comparer = comparer == null ? Comparer<T>.Default : comparer;
        this.heap = new T[capacity];
    }
    //大顶堆
    public void Push(T v)
    {
        if (Count >= heap.Length) Array.Resize(ref heap, Count * 2);
        heap[Count++] = v;
        int idx = Count - 1;
        int parentIdx = (idx - 1) / 2;
        while(0<= parentIdx)
        {
            if (comparer.Compare(heap[idx], heap[parentIdx]) <= 0) break;
            var tmp = heap[idx];
            heap[idx] = heap[parentIdx];
            heap[parentIdx] = tmp;
            idx = parentIdx;
            parentIdx = (idx - 1) / 2;
        }
    }

    public T Pop()
    {
        if (Count <= 0) throw new InvalidOperationException("优先队列为空");
        T max = heap[0];

        T b = heap[Count - 1];
        int idx = 0;
        heap[idx] = b;
        while (true)
        {
            int leftChildIdx = idx * 2 + 1;
            int rightChildIdx = idx * 2 + 2;
            int targetPos = idx;
            if(leftChildIdx < Count && comparer.Compare(heap[targetPos],heap[leftChildIdx])< 0)
            {
                targetPos = leftChildIdx;
            }

            if(rightChildIdx < Count && comparer.Compare(heap[targetPos],heap[rightChildIdx])< 0)
            {
                targetPos = rightChildIdx;
            }

            if (targetPos == idx) break;

            var tmp = heap[idx];
            heap[idx] = heap[targetPos];
            heap[targetPos] = tmp;
            idx = targetPos;
        }
        Count--;
        return max;

    }

    
    //public void Push1(T v)
    //{
    //    if (Count >= heap.Length) Array.Resize(ref heap, Count * 2);
    //    heap[Count] = v;
    //    SiftUp(Count++);
    //}
    //void SiftUp(int n)
    //{
    //    var v = heap[n];
    //    for (var n2 = n / 2; n > 0 && comparer.Compare(v, heap[n2]) > 0; n = n2, n2 /= 2) heap[n] = heap[n2];
    //    heap[n] = v;
    //}
    //public T Pop1()
    //{
    //    var v = Top();
    //    heap[0] = heap[--Count];
    //    if (Count > 0) SiftDown(0);
    //    return v;
    //}

    //public T Top()
    //{
    //    if (Count > 0) return heap[0];
    //    throw new InvalidOperationException("优先队列为空");
    //}



    //void SiftDown(int n)
    //{
    //    var v = heap[n];
    //    for (var n2 = n * 2; n2 < Count; n = n2, n2 *= 2)
    //    {
    //        if (n2 + 1 < Count && comparer.Compare(heap[n2 + 1], heap[n2]) > 0) n2++;
    //        if (comparer.Compare(v, heap[n2]) >= 0) break;
    //        heap[n] = heap[n2];
    //    }
    //    heap[n] = v;
    //}


public override string ToString()
    {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < Count; i++)
        {
            sb.Append(heap[i]);
            sb.Append(",");
        }
 
        return sb.ToString();
    }

    public void Dispose()
    {
        heap = null;
        comparer = null;
    }
}
