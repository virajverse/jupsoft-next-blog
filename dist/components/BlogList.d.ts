import React from 'react';
export interface BlogListPageProps {
    searchParams?: Promise<{
        page?: string;
        category?: string;
        tag?: string;
        q?: string;
        lang?: string;
    }>;
}
export declare function JupsoftBlogList({ searchParams }: BlogListPageProps): Promise<React.JSX.Element>;
//# sourceMappingURL=BlogList.d.ts.map