// app/sitemap.ts
import { MetadataRoute } from 'next';

async function fetchDynamicPages() {
  const blogs = [{slug: 'blog/blog-1', updatedAt: new Date()}, {slug: 'blog/blog-2', updatedAt: new Date()}, {slug: 'blog/blog-3', updatedAt: new Date()}];
  const caseStudies = [{slug: 'case-study/case-study-1', updatedAt: new Date()}, {slug: 'case-study/case-study-2', updatedAt: new Date()}, {slug: 'case-study/case-study-3', updatedAt: new Date()}];

  return [...blogs, ...caseStudies];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicPages = await fetchDynamicPages();

  const dynamicRoutes = dynamicPages.map((page) => ({
    url: `https://www.techmorphers.com/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    {
      url: 'https://www.techmorphers.com',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: 'https://www.techmorphers.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://www.techmorphers.com/packages',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://www.techmorphers.com/services/web',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.techmorphers.com/services/mobile',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.techmorphers.com/services/design',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.techmorphers.com/services/game-development',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: 'https://www.techmorphers.com/support',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: 'https://www.techmorphers.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://www.techmorphers.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: 'https://www.techmorphers.com/estimator',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  ];

  return [...staticRoutes, ...dynamicRoutes] as MetadataRoute.Sitemap;
}
