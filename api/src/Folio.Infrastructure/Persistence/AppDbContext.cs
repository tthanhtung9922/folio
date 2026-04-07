using Folio.Application.Common.Interfaces;
using Folio.Domain.Showcase;
using Microsoft.EntityFrameworkCore;

namespace Folio.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    // Thêm DbSet cho từng entity ở đây khi có entity
    // Ví dụ: public DbSet<Post> Posts => Set<Post>();
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ApplyConfigurationsFromAssembly: Thay vì cấu hình entity trực tiếp trong OnModelCreating
        // pattern này tự động quét và load tất cả class implement IEntityTypeConfiguration<T> trong cùng assembly.
        // Giúp OnModelCreating luôn gọn, không phình to theo số entity.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Nếu cần, có thể thêm logic xử lý trước khi lưu thay đổi vào database ở đây
        return base.SaveChangesAsync(cancellationToken);
    }
}