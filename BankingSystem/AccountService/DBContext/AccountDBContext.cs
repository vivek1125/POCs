using AccountService.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountService.DBContext
{
    public class AccountDBContext : DbContext
    {
        public AccountDBContext(DbContextOptions<AccountDBContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }

    }
}
