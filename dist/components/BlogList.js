import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { headers } from 'next/headers';
import { jupsoft } from '../client.js';
export async function JupsoftBlogList({ searchParams, client }) {
    const activeClient = client || jupsoft;
    const sp = (searchParams ? await searchParams : {});
    // Fix Bug #12: Sanitize page number to positive integer
    const currentPage = Math.max(1, Math.floor(Number(sp.page) || 1));
    const selectedCategory = sp.category || '';
    const searchQuery = sp.q || '';
    // Fix Bug #9: Auto-detect visitor system language using ordered preference matching
    const headerStore = await headers();
    const acceptLang = (headerStore.get('accept-language') || '').toLowerCase();
    let currentLang = sp.lang;
    if (!currentLang) {
        const langs = acceptLang.split(',').map((s) => s.split(';')[0].trim().slice(0, 2));
        const supported = ['en', 'hi', 'fr', 'ar'];
        currentLang = supported.find((l) => langs.includes(l)) || 'en';
    }
    const [blogsRes, categoriesRes] = await Promise.all([
        activeClient.getBlogs({
            page: currentPage,
            limit: 9,
            category: selectedCategory || undefined,
            q: searchQuery || undefined,
            lang: currentLang,
        }),
        activeClient.getCategories().catch(() => ({ success: true, data: [] })),
    ]);
    const blogs = blogsRes.data || [];
    const total = blogsRes.meta?.total || blogs.length;
    const totalPages = Math.ceil(total / 9) || 1;
    const categories = categoriesRes.data || [];
    const resolveImageUrl = (img) => {
        if (!img)
            return '';
        if (img.startsWith('http://') || img.startsWith('https://'))
            return img;
        const base = activeClient.apiUrl || 'https://blogary.jupsoft.com';
        return `${base.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
    };
    return (_jsxs("main", { className: "max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-3xl mx-auto mb-8", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4", children: "Latest News & Insights" }), _jsx("p", { className: "text-lg text-slate-600", children: "Stay informed with architectural insights, technology guides, and enterprise updates." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-slate-100", children: [_jsxs("div", { className: "flex items-center flex-wrap gap-2", children: [_jsx(Link, { href: `/blog?lang=${currentLang}`, className: `px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCategory
                                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`, children: "All" }), categories.map((cat) => (_jsx(Link, { href: `/blog?category=${encodeURIComponent(cat.slug || cat.id)}&lang=${currentLang}`, className: `px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === (cat.slug || cat.id)
                                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`, children: cat.name }, cat.id)))] }), _jsxs("details", { className: "relative inline-block self-end sm:self-auto cursor-pointer", children: [_jsxs("summary", { className: "list-none select-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200/80", children: [_jsx("span", { className: "text-sm leading-none", children: "\uD83C\uDF10" }), _jsx("span", { className: "uppercase tracking-wider", children: currentLang }), _jsx("span", { className: "text-[10px] text-slate-400", children: "\u25BE" })] }), _jsx("div", { className: "absolute right-0 top-full mt-1.5 w-36 py-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-50", children: [
                                    { code: 'en', native: 'English' },
                                    { code: 'hi', native: 'हिंदी' },
                                    { code: 'fr', native: 'Français' },
                                    { code: 'ar', native: 'العربية' },
                                ].map((l) => (_jsxs(Link, { href: `/blog?lang=${l.code}${selectedCategory ? `&category=${selectedCategory}` : ''}`, className: `flex items-center justify-between px-3.5 py-1.5 text-xs transition-colors ${currentLang === l.code
                                        ? 'font-bold text-blue-600 bg-blue-50'
                                        : 'text-slate-700 hover:bg-slate-50'}`, children: [_jsx("span", { children: l.native }), _jsx("span", { className: "text-[10px] uppercase font-mono text-slate-400", children: l.code })] }, l.code))) })] })] }), blogs.length === 0 ? (_jsx("div", { className: "text-center py-20 bg-slate-50 rounded-2xl border border-slate-200", children: _jsx("p", { className: "text-slate-500 text-lg", children: "No articles found in this category." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: blogs.map((post) => (_jsxs("article", { className: "bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col", children: [post.featuredImage && (_jsx(Link, { href: `/blog/${post.slug}?lang=${currentLang}`, className: "block relative aspect-video overflow-hidden bg-slate-100", children: _jsx("img", { src: resolveImageUrl(post.featuredImage), alt: post.title, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-300", loading: "lazy" }) })), _jsxs("div", { className: "p-6 flex-1 flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500 mb-3", children: [_jsx("span", { children: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent' }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { children: [post.readTimeMinutes || 5, " min read"] })] }), _jsx("h2", { className: "text-xl font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors", children: _jsx(Link, { href: `/blog/${post.slug}?lang=${currentLang}`, children: post.title }) }), _jsx("p", { className: "text-sm text-slate-600 mb-4 line-clamp-3 flex-1", children: post.excerpt }), _jsxs("div", { className: "pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", children: [_jsx("span", { className: "font-medium text-slate-900", children: post.authorName }), _jsx(Link, { href: `/blog/${post.slug}?lang=${currentLang}`, className: "text-blue-600 font-semibold hover:underline", children: "Read article \u2192" })] })] })] }, post.id))) })), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-12", children: [currentPage > 1 && (_jsx(Link, { href: `/blog?page=${currentPage - 1}&lang=${currentLang}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`, className: "px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50", children: "\u2190 Previous" })), _jsxs("span", { className: "text-sm text-slate-500 px-3", children: ["Page ", currentPage, " of ", totalPages] }), currentPage < totalPages && (_jsx(Link, { href: `/blog?page=${currentPage + 1}&lang=${currentLang}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`, className: "px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50", children: "Next \u2192" }))] }))] }));
}
