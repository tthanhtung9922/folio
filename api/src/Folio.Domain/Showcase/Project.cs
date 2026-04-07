using Folio.Domain.Common;

namespace Folio.Domain.Showcase;

public class Project : Entity, IAggregateRoot
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? Url { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Constructor rỗng cho EF Core — không được dùng trực tiếp
    private Project() { }

    public static Project Create(string title, string description, string? url = null)
    {
        return new Project
        {
            Title = title,
            Description = description,
            Url = url,
            CreatedAt = DateTime.UtcNow,
        };
    }
}