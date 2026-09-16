import { JupsoftConfig, BlogPost, BlogListResponse, Category, Tag } from './types.js';
export declare class JupsoftClient {
    private config;
    constructor(config?: Partial<JupsoftConfig>);
    get apiUrl(): string;
    get apiKey(): string;
    get websiteId(): string;
    get defaultLang(): string;
    private request;
    getBlogs(params?: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        lang?: string;
        q?: string;
    }): Promise<BlogListResponse>;
    getBlogBySlug(slug: string, lang?: string): Promise<BlogPost | null>;
    getLatest(limit?: number, lang?: string): Promise<BlogPost[]>;
    getPopular(limit?: number, lang?: string): Promise<BlogPost[]>;
    getCategories(): Promise<{
        success: boolean;
        data: Category[];
    }>;
    getTags(): Promise<{
        success: boolean;
        data: Tag[];
    }>;
    search(query: string, lang?: string, limit?: number): Promise<{
        success: boolean;
        data: BlogPost[];
    }>;
    getWebsiteInfo(): Promise<any>;
    recordView(slug: string, blogId?: string): Promise<void>;
    verifyWebhookSignature(payloadText: string, signature: string | null, secret?: string): Promise<boolean>;
}
export declare const jupsoft: JupsoftClient;
//# sourceMappingURL=client.d.ts.map