import { jupsoft } from './client.js';
export async function generateBlogMeta({ params, searchParams }) {
    const { slug } = await params;
    const sp = await searchParams;
    const lang = sp?.lang || 'en';
    const blog = await jupsoft.getBlogBySlug(slug, lang);
    if (!blog) {
        return { title: 'Article Not Found' };
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_DOMAIN || '';
    return {
        title: blog.seo?.metaTitle || blog.title,
        description: blog.seo?.metaDescription || blog.excerpt,
        alternates: {
            canonical: baseUrl ? `${baseUrl}/blog/${slug}${lang !== 'en' ? `?lang=${lang}` : ''}` : undefined,
            languages: baseUrl ? {
                'en': `${baseUrl}/blog/${slug}?lang=en`,
                'hi': `${baseUrl}/blog/${slug}?lang=hi`,
                'fr': `${baseUrl}/blog/${slug}?lang=fr`,
                'ar': `${baseUrl}/blog/${slug}?lang=ar`,
                'x-default': `${baseUrl}/blog/${slug}`,
            } : undefined,
        },
        openGraph: {
            title: blog.seo?.ogTitle || blog.title,
            description: blog.seo?.ogDescription || blog.excerpt,
            images: blog.featuredImage ? [blog.featuredImage] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: blog.seo?.twitterTitle || blog.title,
            description: blog.seo?.twitterDescription || blog.excerpt,
            images: blog.seo?.twitterImage ? [blog.seo.twitterImage] : (blog.featuredImage ? [blog.featuredImage] : []),
        },
    };
}
