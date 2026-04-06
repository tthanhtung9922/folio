using Folio.Application.Common.Interfaces;
using Folio.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Folio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

        // AddScoped<IAppDbContext>: Dòng này đăng ký mapping IAppDbContext → AppDbContext trong DI container.
        // Khi một use case trong Application layer yêu cầu IAppDbContext qua constructor injection, DI sẽ trả về instance AppDbContext đã được cấu hình sẵn.
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Đăng ký health check để kiểm tra kết nối đến database.
        // Khi health check được gọi, nó sẽ sử dụng AppDbContext để xác minh rằng ứng dụng có thể kết nối và truy cập cơ sở dữ liệu một cách bình thường.
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        return services;
    }
}