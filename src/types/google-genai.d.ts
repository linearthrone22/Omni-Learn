declare module '@google/genai' {
  export const Type: Record<string, any>;

  export class GoogleGenAI {
    constructor(config: {
      apiKey: string;
      httpOptions?: {
        headers?: Record<string, string>;
      };
    });

    models: {
      generateContent(args: {
        model: string;
        contents: string;
        config?: Record<string, any>;
      }): Promise<{ text?: string }>;
    };
  }
}
