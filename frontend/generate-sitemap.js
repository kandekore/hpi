// generate-sitemap.js
require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

async function generateSitemap() {
  try {
    // Read the base URL from your .env
    const domain = process.env.REACT_APP_GRAPHQL_URI;
    if (!domain) {
      throw new Error('REACT_APP_GRAPHQL_URI is not defined in .env');
    }

    // Define your routes here:
    const links = [
      { url: '/',         changefreq: 'monthly',  priority: 1.0 },
      { url: '/valuation', changefreq: 'monthly', priority: 0.8 },
      { url: '/mot',       changefreq: 'monthly', priority: 0.8 },
      { url: '/register',  changefreq: 'monthly', priority: 0.8 },
      { url: '/login',     changefreq: 'monthly', priority: 0.8 },
      { url: '/hpi',       changefreq: 'monthly', priority: 0.8 },
      { url: '/sample',    changefreq: 'monthly', priority: 0.8 },
    ];

    // Create a stream to write to
    const sitemapStream = new SitemapStream({ hostname: domain });

    // Write each route into the stream
    links.forEach((link) => {
      sitemapStream.write(link);
    });

    // End the stream
    sitemapStream.end();

    // Convert stream to a string
    const sitemapData = await streamToPromise(sitemapStream);

    // Write sitemap to the public folder (so it's served at /sitemap.xml)
    fs.writeFileSync('./public/sitemap.xml', sitemapData.toString());

    console.log('✅  Sitemap generated successfully in ./public/sitemap.xml');
  } catch (error) {
    console.error('❌  Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the function
generateSitemap();
