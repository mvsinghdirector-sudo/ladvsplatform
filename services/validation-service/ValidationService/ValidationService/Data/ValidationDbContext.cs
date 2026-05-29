using Microsoft.EntityFrameworkCore;
using ValidationService.Models.Entities;

namespace ValidationService.Data
{
    public class ValidationDbContext : DbContext
    {
        public ValidationDbContext(
            DbContextOptions<ValidationDbContext> options)
            : base(options) { }

        public DbSet<ValidationResult> ValidationResults { get; set; }
        public DbSet<ValidationOutbox> ValidationOutbox { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ValidationResult>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ApplicationId)
                      .IsRequired().HasMaxLength(100);
                entity.Property(e => e.ValidationScore)
                      .HasColumnType("decimal(5,2)");
                entity.Property(e => e.ValidatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ApplicationId);
            });

            modelBuilder.Entity<ValidationOutbox>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EventType)
                      .IsRequired().HasMaxLength(100);
            });
        }
    }
}