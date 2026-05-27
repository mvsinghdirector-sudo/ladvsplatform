using ApplicationService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApplicationService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<LoanApplication> LoanApplications { get; set; }
        public DbSet<ApplicationOutbox> ApplicationOutbox { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<LoanApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ApplicationNumber)
                      .IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.ApplicationNumber).IsUnique();
                entity.Property(e => e.RequestedAmount)
                      .HasColumnType("decimal(18,2)");
                entity.Property(e => e.ApprovedAmount)
                      .HasColumnType("decimal(18,2)");
                entity.Property(e => e.MonthlyIncome)
                      .HasColumnType("decimal(18,2)");
                entity.Property(e => e.InterestRate)
                      .HasColumnType("decimal(5,2)");
                entity.Property(e => e.MonthlyEMI)
                      .HasColumnType("decimal(18,2)");
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<ApplicationOutbox>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EventType)
                      .IsRequired().HasMaxLength(100);
                entity.Property(e => e.Status)
                      .HasMaxLength(20);
            });
        }
    }
}