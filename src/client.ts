import { JupsoftConfig, BlogPost, BlogListResponse, Category, Tag } from './types.js';

export class JupsoftClient {
  private apiUrl: string;
  private apiKey: string;
  private websiteId: string;
  private defaultLang: string;

  constructor(config?: Partial<JupsoftConfig>) {
    this.apiUrl = (config?.apiUrl || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_CMS_API_URL : '') || '').replace(/\/$/, '');
    this.apiKey = config?.apiKey || (typeof process !== 'undefined' ? process.env?.CMS_TENANT_API_KEY : '') || '';
    this.websiteId = config?.websiteId || (typeof process !== 'undefined' ? process.env?.CMS_WEBSITE_ID : '') || '';
    this.defaultLang = config?.defaultLang || 'en';
  }

  private async request<T>(path: string, options: { tags?: string[]; revalidate?: number } = {}): Promise<T> {
    if (!this.apiUrl) {
      throw new Error('Jupsoft CMS Error: NEXT_PUBLIC_CMS_API_URL is missing. Please define it in your .env.local file.');
    }
    if (!this.apiKey) {
      throw new Error('Jupsoft CMS Error: CMS_TENANT_API_KEY is missing. Please define it in your .env.local file.');
    }
    if (!this.websiteId) {
      throw new Error('Jupsoft CMS Error: CMS_WEBSITE_ID is missing. Please define it in your .env.local file.');
    }

    const url = new URL(`${this.apiUrl}${path}`);
    if (this.websiteId) {
      if (!url.searchParams.has('websiteId')) url.searchParams.set('websiteId', this.websiteId);
      if (!url.searchParams.has('website')) url.searchParams.set('website', this.websiteId);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }
    if (this.websiteId) {
      headers['X-Tenant-ID'] = this.websiteId;
    }

    const res = await fetch(url.toString(), {
      headers,
      next: {
        tags: options.tags || ['blogs'],
        revalidate: options.revalidate ?? 3600,
      } as any,
    });

    if (!res.ok) {
      throw new Error(`Jupsoft CMS Error: ${res.status} ${res.statusText} on ${path}`);
    }

    return res.json() as Promise<T>;
  }

  async getBlogs(params?: { page?: number; limit?: number; category?: string; tag?: string; lang?: string; q?: string }): Promise<BlogListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.lang || this.defaultLang) query.set('lang', params?.lang || this.defaultLang);
    if (params?.q) query.set('q', params.q);

    return this.request<BlogListResponse>(`/v1/blogs?${query.toString()}`, {
      tags: ['blogs', 'blogs-list'],
    });
  }

  async getBlogBySlug(slug: string, lang?: string): Promise<BlogPost | null> {
    try {
      const res = await this.request<{ success: boolean; data: BlogPost }>(
        `/v1/blogs/${encodeURIComponent(slug)}?lang=${lang || this.defaultLang}`,
        { tags: [`blog:${slug}`, 'blogs'] }
      );
      return res.data;
    } catch {
      return null;
    }
  }

  async getLatest(limit = 5, lang?: string): Promise<BlogPost[]> {
    const res = await this.request<{ success: boolean; data: BlogPost[] }>(
      `/v1/blogs/latest?limit=${limit}&lang=${lang || this.defaultLang}`,
      { tags: ['blogs', 'blogs-latest'] }
    );
    return res.data || [];
  }

  async getPopular(limit = 5, lang?: string): Promise<BlogPost[]> {
    const res = await this.request<{ success: boolean; data: BlogPost[] }>(
      `/v1/blogs/popular?limit=${limit}&lang=${lang || this.defaultLang}`,
      { tags: ['blogs', 'blogs-popular'] }
    );
    return res.data || [];
  }

  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return this.request<{ success: boolean; data: Category[] }>('/v1/categories', {
      tags: ['categories'],
    });
  }

  async getTags(): Promise<{ success: boolean; data: Tag[] }> {
    return this.request<{ success: boolean; data: Tag[] }>('/v1/tags', {
      tags: ['tags'],
    });
  }

  async search(query: string, lang?: string, limit = 10): Promise<{ success: boolean; data: BlogPost[] }> {
    return this.request<{ success: boolean; data: BlogPost[] }>(
      `/v1/search?q=${encodeURIComponent(query)}&lang=${lang || this.defaultLang}&limit=${limit}`,
      { tags: ['blogs'] }
    );
  }

  async getWebsiteInfo(): Promise<any> {
    return this.request<any>('/v1/website');
  }

  recordView(slug: string, blogId?: string): void {
    fetch(`${this.apiUrl}/v1/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}` 
      },
      body: JSON.stringify({
        websiteId: this.websiteId,
        slug,
        blogId,
      }),
    }).catch(() => {});
  }

  async verifyWebhookSignature(payloadText: string, signature: string | null, secret?: string): Promise<boolean> {
    const targetSecret = secret || (typeof process !== 'undefined' ? process.env?.CMS_WEBHOOK_SECRET : undefined);
    if (!signature || !targetSecret) return false;
    const cleanSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    try {
      if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
        const encoder = new TextEncoder();
        const key = await globalThis.crypto.subtle.importKey(
          'raw',
          encoder.encode(targetSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sigBuffer = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(payloadText));
        const computedHex = Array.from(new Uint8Array(sigBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return computedHex === cleanSig;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const jupsoft = new JupsoftClient();
