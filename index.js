const https = require('https');
const cheerio = require('cheerio');

module.exports = class LinkHierarchyExtractor {
    constructor() {
        this.linkStructure = new Map();
        this.debug = true;
        this.baseUrl = '';
    }

    log(message, data = '') {
        if (this.debug) {
            console.log(`[DEBUG] ${message}`, data);
        }
    }

    findNavigationPath(link, $) {
        const path = [];
        let current = link;

        while (current.length) {
            const sectionHeader = current.closest('section').find('h1, h2, h3, h4, h5, h6').first();
            if (sectionHeader.length) {
                const sectionText = sectionHeader.text().trim();
                if (sectionText && !path.includes(sectionText)) {
                    path.unshift(sectionText);
                }
            }

            const parentMenu = current.closest('nav, .menu, .dropdown-menu, ul, ol');
            if (parentMenu.length) {
                const menuItem = parentMenu.find('a, span').first();
                if (menuItem.length) {
                    const menuText = menuItem.text().trim();
                    if (menuText && !path.includes(menuText)) {
                        path.unshift(menuText);
                    }
                }
            }
            current = current.parent();
        }

        const linkText = link.text().trim();
        if (linkText && !path.includes(linkText)) {
            path.push(linkText);
        }

        return path;
    }

    async extractLinks(url) {
        try {
            this.baseUrl = url;
            this.log(`Fetching URL: ${url}`);

            // Use the native https module to fetch the URL
            const html = await this.fetchUrl(url);
            
            const $ = cheerio.load(html);
            
            const links = $('a');
            this.log(`Found ${links.length} links`);

            links.each((_, element) => {
                const link = $(element);
                const href = link.attr('href');
                if (!href || href === '#' || href.startsWith('javascript')) return;

                const navigationPath = this.findNavigationPath(link, $);
                this.processLink(href, navigationPath, url);
            });

            return this.generateHierarchicalStructure();
        } catch (error) {
            console.error('Error extracting links:', error);
            throw error;
        }
    }

    // Helper method to make an HTTP request using the https module
    fetchUrl(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                
                // Collect data chunks
                res.on('data', chunk => {
                    data += chunk;
                });
                
                // Once the response is complete, resolve the promise with the data
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    processLink(href, navigationPath, baseUrl) {
        try {
            const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
            this.log(`Processing link: ${fullUrl}`);
            this.log(`Navigation path: ${navigationPath.join(' > ')}`);

            const pathKey = fullUrl.split('/').filter(Boolean).join('-');

            if (!this.linkStructure.has(pathKey)) {
                this.linkStructure.set(pathKey, {
                    fullPath: fullUrl,
                    breadcrumb: navigationPath.join(' > '),
                    navigationPath: navigationPath,
                    href: href
                });
            }
        } catch (e) {
            this.log(`Error processing link: ${href}`, e.message);
        }
    }

    generateHierarchicalStructure() {
        const structure = {};
        
        this.linkStructure.forEach((value, key) => {
            structure[key] = {
                fullPath: value.fullPath,
                breadcrumb: value.breadcrumb,
                navigationPath: value.navigationPath,
                href: value.href
            };
        });
        
        return structure;
    }
};
