namespace Gen.Platform.Services
{

  /// <summary>
  /// Sample utility class for the PF GEN Platform
  /// </summary>
  public static class Greeting
  {
    /// <summary>
    /// Returns a greeting message with the provided name
    /// </summary>
    /// <param name="name">The name to include in the greeting</param>
    /// <returns>A formatted greeting message</returns>
    public static string SayHello(string? name)
    {
      if (string.IsNullOrWhiteSpace(name))
      {
        return "Hello, World!";
      }

      return $"Hello, {name}!";
    }
  }

}
