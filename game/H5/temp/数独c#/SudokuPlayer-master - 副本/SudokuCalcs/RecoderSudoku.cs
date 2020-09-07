using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SudokuCalcs
{
    /// <summary>
    /// 剔除重复选择？  重编码  包含候选数，x，y，value
    /// </summary>
    class RecoderSudoku
    {
        public int Value { get; set; }
        public int X { get;set;}
        public int Y { get; set; }
        public LiveNumbers[,] SudokuLiveNumbersArry { get; set; }
    }
}
