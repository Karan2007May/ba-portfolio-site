// data-loader.js
// Universal data loader supporting HTTP fetch, multi-path candidate resolution, and fallback support

const DataLoader = {
    getRootPrefix() {
        const path = window.location.pathname.toLowerCase();
        const isSubfolder = path.includes('/projects/') || path.includes('/blog/') || path.includes('/documents/');
        return isSubfolder ? '../' : './';
    },

    async fetchJSON(url) {
        const cleanUrl = url.replace(/^\.?\/?/, '');
        const rootPrefix = this.getRootPrefix();

        // Try candidate paths in order of likelihood
        const candidates = [
            rootPrefix + cleanUrl,
            './' + cleanUrl,
            '../' + cleanUrl,
            '/' + cleanUrl
        ];

        for (const candidate of candidates) {
            try {
                const response = await fetch(candidate);
                if (response && response.ok) {
                    const data = await response.json();
                    if (data) return data;
                }
            } catch (err) {
                // Continue trying candidate URLs
            }
        }

        // Fallback for direct file:// browsing where browsers block fetch()
        if (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA[cleanUrl]) {
            return window.PORTFOLIO_DATA[cleanUrl];
        }

        console.warn(`DataLoader: Unable to fetch ${url} via HTTP.`);
        return null;
    },

    async getProfile() {
        return await this.fetchJSON('data/profile.json');
    },

    async getProjects() {
        return await this.fetchJSON('data/projects.json');
    },

    async getDocuments() {
        return await this.fetchJSON('data/documents.json');
    },

    async getBlogPosts() {
        return await this.fetchJSON('data/blog.json');
    }
};
