using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AuthService.DBContext
{
    public class AuthDBContext : DbContext
    {
        public AuthDBContext(DbContextOptions<AuthDBContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(usr => usr.Id)
                .UseIdentityColumn(seed: 101, increment: 1);
            modelBuilder.Entity<User>()
                .Property(a => a.Role)
                .HasConversion<string>();
            base.OnModelCreating(modelBuilder);
        }
    }
}
