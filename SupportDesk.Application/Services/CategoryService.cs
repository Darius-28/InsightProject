using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SupportDesk.Application.Interfaces;
using SupportDesk.Core.Entities;
using SupportDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace SupportDesk.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly SupportDeskDbContext _context;

        public CategoryService(SupportDeskDbContext context)
        {
            _context = context;
        }

        public async Task<Category> GetOrCreateCategoryAsync(string categoryName)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == categoryName);

            if (category == null)
            {
                category = new Category { Name = categoryName };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
            }

            return category;
        }
    }
}
