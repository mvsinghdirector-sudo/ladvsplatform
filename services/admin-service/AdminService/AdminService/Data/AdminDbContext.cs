using AdminService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Data
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(
            DbContextOptions<AdminDbContext> options)
            : base(options) { }

        public DbSet<AdminActionLog> AdminActionLogs { get; set; }
        public DbSet<AdminUser> AdminUsers { get; set; }
        public DbSet<AdminOutbox> AdminOutbox { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AdminActionLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ApplicationId)
                      .IsRequired().HasMaxLength(100);
                entity.Property(e => e.ActionType)
                      .IsRequired().HasMaxLength(50);
                entity.Property(e => e.ActionTakenAt)
                      .HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ApplicationId);
                entity.HasIndex(e => e.AdminId);
            });

            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email)
                      .IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<AdminOutbox>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EventType)
                      .IsRequired().HasMaxLength(100);
            });
        }
    }
}