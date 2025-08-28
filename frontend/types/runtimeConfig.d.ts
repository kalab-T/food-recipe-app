export interface PublicRuntimeConfig {
    hasuraUrl: string;
    fileUploadApi: string;
    imageDomainPath: string;
    chapaApiKey: string;
    chapaInitApi: string;
  }
  
  declare module '#app' {
    interface RuntimeConfig {
      public: PublicRuntimeConfig;
    }
  }
  