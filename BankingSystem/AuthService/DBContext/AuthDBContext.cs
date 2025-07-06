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
             .HasIndex(u => u.UserName)
             .IsUnique();

            modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .ValueGeneratedOnAdd()
            .HasAnnotation("SqlServer:Identity", "101, 1");

            var converter = new EnumToStringConverter<UserRole>();

            modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion(converter);

            base.OnModelCreating(modelBuilder);

        }
    }
}
