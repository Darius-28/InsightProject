using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Core.Entities;

namespace SupportDesk.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<Category> GetOrCreateCategoryAsync(string categoryName);
    }
}
