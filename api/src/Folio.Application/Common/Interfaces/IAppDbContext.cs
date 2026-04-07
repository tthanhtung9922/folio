using Folio.Domain.Showcase;
using Microsoft.EntityFrameworkCore;

namespace Folio.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Project> Projects { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
