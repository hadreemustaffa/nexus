export function mockOllamaResponse(content?: string): void {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({
      message: {
        content,
      },
    }),
  } as Response);
}
