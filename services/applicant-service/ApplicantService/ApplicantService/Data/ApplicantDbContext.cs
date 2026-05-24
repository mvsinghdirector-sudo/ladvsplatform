using ApplicantService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApplicantService.Data
{
    public class ApplicantDbContext : DbContext
    {
        public ApplicantDbContext(DbContextOptions<ApplicantDbContext> options)
            : base(options)
        {
        }

        public DbSet<Applicant> Applicants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Applicant>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(15);

                entity.Property(e => e.PanNumber)
                    .HasMaxLength(10);

                entity.HasIndex(e => e.PanNumber)
                    .IsUnique();

                entity.Property(e => e.AadhaarNumber)
                    .HasMaxLength(12);

                entity.HasIndex(e => e.AadhaarNumber)
                    .IsUnique();

                entity.Property(e => e.MonthlyIncome)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.RequestedLoanAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}