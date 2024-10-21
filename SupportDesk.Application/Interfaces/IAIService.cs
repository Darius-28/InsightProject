using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SupportDesk.Application.Interfaces
{
    public interface IAIService
    {
        Task<string> QueryAsync(string input);
        Task<string> GenerateTitleAsync(string description);
        Task<string> GeneratePriorityAsync(string description);
        Task<string> GenerateStepsToReproduceAsync(string description);
        Task<string> GetSuggestionAsync(string prompt);
    }
}
