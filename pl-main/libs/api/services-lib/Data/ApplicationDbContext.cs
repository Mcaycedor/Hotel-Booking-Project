using Microsoft.EntityFrameworkCore;
using Gen.StarterApp.Services.Data.Entities;

namespace Gen.StarterApp.Services.Data;

/// <summary>
/// Entity Framework Core DbContext for Candidate Assessment feature
/// Manages all database access for assessments, questions, and responses
/// </summary>
public class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Constructor
    /// </summary>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for entities
    public DbSet<AssessmentEntity> Assessments { get; set; } = null!;
    public DbSet<InterviewQuestionEntity> InterviewQuestions { get; set; } = null!;
    public DbSet<CandidateResponseEntity> CandidateResponses { get; set; } = null!;

    /// <summary>
    /// Configure model relationships and constraints
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Assessment entity
        modelBuilder.Entity<AssessmentEntity>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.CandidateName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.JobTitle)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Draft");

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Relationships
            entity.HasMany(e => e.InterviewQuestions)
                .WithOne(q => q.Assessment)
                .HasForeignKey(q => q.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.CandidateResponses)
                .WithOne(r => r.Assessment)
                .HasForeignKey(r => r.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            entity.HasIndex(e => e.CandidateName);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure InterviewQuestion entity
        modelBuilder.Entity<InterviewQuestionEntity>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Question)
                .IsRequired();

            entity.Property(e => e.Difficulty)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Medium");

            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Relationships
            entity.HasMany(e => e.Responses)
                .WithOne(r => r.InterviewQuestion)
                .HasForeignKey(r => r.InterviewQuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            entity.HasIndex(e => e.AssessmentId);
            entity.HasIndex(e => e.Difficulty);
            entity.HasIndex(e => e.Category);
        });

        // Configure CandidateResponse entity
        modelBuilder.Entity<CandidateResponseEntity>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Answer)
                .IsRequired();

            entity.Property(e => e.SubmittedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Indexes
            entity.HasIndex(e => e.AssessmentId);
            entity.HasIndex(e => e.InterviewQuestionId);
        });
    }
}
