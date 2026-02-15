module.exports = {
    ci: {
        collect: {
            startServerCommand: 'npm run start',
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
            settings: {
                preset: 'desktop',
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
        assert: {
            assertions: {
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.9 }],
            },
        },
    },
};
