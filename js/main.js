/**
 * Main JavaScript for Personal Website
 * Handles all page functionality including content loading, theme switching, and interactions
 * 
 * Wrapped in IIFE to avoid polluting global scope
 */
(function() {
    'use strict';

    /**
     * ===================================================================
     *                    CONFIGURATION LOADING
     * ===================================================================
     */

    // Cache for the loaded YAML config
    let siteConfig = null;

    /**
     * Load and parse the YAML configuration file
     * @returns {Promise<object>} Parsed configuration object
     */
    async function loadConfig() {
        if (siteConfig) {
            return siteConfig;
        }
        
        try {
            const response = await fetch('content/site/config.yaml');
            const yamlText = await response.text();
            siteConfig = jsyaml.load(yamlText);
            return siteConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            return null;
        }
    }

    /**
     * Load and parse a YAML content file
     * @param {string} path - Path to YAML file
     * @returns {Promise<object|array>} Parsed YAML data
     */
    async function loadYaml(path) {
        try {
            const response = await fetch(path);
            const yamlText = await response.text();
            return jsyaml.load(yamlText);
        } catch (error) {
            console.error(`Error loading YAML from ${path}:`, error);
            return null;
        }
    }

    /**
     * ===================================================================
     *                    UTILITY FUNCTIONS
     * ===================================================================
     */

    /**
     * Format a date string into human-readable format
     * @param {string} dateString - ISO date string
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    function formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    /**
     * Convert basic markdown formatting to HTML
     * Handles bold text, links, and paragraph breaks
     * @param {string} markdown - Raw markdown text
     * @returns {string} HTML formatted text
     */
    function convertSimpleMarkdownToHtml(markdown) {
        return markdown
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // Bold text
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')  // Links
            .replace(/\n\n+/g, '</p><p>')  // Paragraph breaks
            .replace(/^/, '<p>')  // Start with paragraph
            .replace(/$/, '</p>');  // End with paragraph
    }

    /**
     * Apply inline markdown formatting (bold, italic, links)
     * Used for single-line text like titles and descriptions
     * @param {string} text - Text with markdown formatting
     * @returns {string} HTML formatted text
     */
    function formatInlineMarkdown(text) {
        return text
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')  // Links
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');  // Italic
    }

/**
 * Parse markdown to HTML for blog posts
 * Handles headings, links, bold, italic, and paragraphs
 * @param {string} markdown - Raw markdown text
 * @returns {string} HTML formatted text
 */
function parseMarkdown(markdown) {
    // Remove frontmatter (YAML between ---)
    markdown = markdown.replace(/^---[\s\S]*?---\n/, '');
    
    let html = markdown;
    
    // Parse headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Parse links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Parse bold **text** or __text__
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Parse italic *text*
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    
    // Parse paragraphs (double newline = new paragraph)
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
        block = block.trim();
        if (!block) return '';
        // Don't wrap if it's already an HTML tag
        if (block.startsWith('<h') || block.startsWith('<figure') || 
            block.startsWith('<ul') || block.startsWith('<ol') ||
            block.startsWith('</')) {
            return block;
        }
        return '<p>' + block + '</p>';
    }).join('\n');
    
    return html;
}

/**
 * Initialize theme toggle functionality
 * Handles dark/light mode switching and persistence
 */
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    if (!themeToggle) return;
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}


/**
 * ===================================================================
 *                    TIMELINE FUNCTIONS
 * ===================================================================
 */

/**
 * Load timeline from JSON
 * Displays timeline items sorted by date (most recent first)
 */
async function loadTimeline() {
    try {
        const timeline = await loadYaml('content/timeline/timeline.yaml');
        const listContainer = document.getElementById('timeline-list');
        
        if (!listContainer || !timeline) return;
        
        // Sort by start date (most recent first)
        timeline.sort((a, b) => {
            const dateA = new Date(a.start_date);
            const dateB = new Date(b.start_date);
            return dateB - dateA;
        });
        
        const timelineItems = timeline.map(item => {
            const startDate = new Date(item.start_date);
            const startYear = startDate.getFullYear();
            
            let endYear = '';
            if (item.end_date) {
                if (item.end_date.toLowerCase() === 'present') {
                    endYear = 'Present';
                } else {
                    const endDate = new Date(item.end_date);
                    endYear = endDate.getFullYear();
                }
            }
            
            const yearRange = endYear ? `${startYear} - ${endYear}` : `${startYear} -`;
            
            // Format description with markdown support and paragraph breaks
            let formattedDescription = item.description || '';
            formattedDescription = formatInlineMarkdown(formattedDescription);
            // Support paragraph breaks with \n\n
            formattedDescription = formattedDescription.replace(/\n\n/g, '</p><p class="timeline-description">');
            
            // Make logo clickable if URL exists
            const logoHTML = item.url 
                ? `<a href="${item.url}" target="_blank" class="timeline-logo-link"><img src="${item.logo}" alt="${item.organization}" class="timeline-logo"></a>`
                : `<img src="${item.logo}" alt="${item.organization}" class="timeline-logo">`;
            
            return `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-year">${yearRange}</div>
                ${logoHTML}
                <div class="timeline-content">
                    <p class="timeline-description">${formattedDescription}</p>
                </div>
            </div>
            `;
        });
        
        listContainer.innerHTML = timelineItems.join('');
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}


/**
 * ===================================================================
 *                    MEDIA FUNCTIONS
 * ===================================================================
 */

/**
 * Load and display media/highlights from media.json
 * Creates YouTube embed iframes with optional timestamps
 */
async function loadMedia() {
    try {
        const mediaItems = await loadYaml('content/media/media.yaml');
        
        const container = document.getElementById('media-list');
        if (!container || !mediaItems) return;
        
        const mediaCards = mediaItems.map(item => {
            const videoUrl = item.timestamp 
                ? `https://www.youtube.com/embed/${item.video_id}?start=${item.timestamp}`
                : `https://www.youtube.com/embed/${item.video_id}`;
            
            // Format title and description with markdown support
            const formattedTitle = formatInlineMarkdown(item.title);
            const formattedDescription = formatInlineMarkdown(item.description);
            
            return `
            <div class="media-item">
                <div class="media-thumbnail">
                    <iframe 
                        src="${videoUrl}" 
                        title="${item.title}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="media-info">
                    <h3>${formattedTitle}</h3>
                    <p>${formattedDescription}</p>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = mediaCards.join('');
        
    } catch (error) {
        console.error('Error loading media:', error);
    }
}


/**
 * ===================================================================
 *                    MAIN PAGE FUNCTIONS (index.html)
 * ===================================================================
 */

/**
 * Load site metadata (name, role, affiliation) from site.json
 * Updates the site name, role title, affiliation, and footer name
 */
async function loadSiteMetadata() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        // Update site name in header
        const siteNameElement = document.getElementById('site-name');
        if (siteNameElement && config.site?.name) {
            siteNameElement.textContent = config.site.name;
        }
        
        // Update page title
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement && config.site?.page_title) {
            pageTitleElement.textContent = config.site.page_title;
        }
        
        // Update nationality flags (optional)
        const nationalityFlagsElement = document.getElementById('nationality-flags');
        if (nationalityFlagsElement && config.site?.nationality_flags) {
            nationalityFlagsElement.textContent = config.site.nationality_flags;
        }
        
        // Update role information
        const roleTitleElement = document.getElementById('role-title');
        const roleAffiliationElement = document.getElementById('role-affiliation');
        if (roleTitleElement && config.site?.role?.title) {
            roleTitleElement.textContent = config.site.role.title;
        }
        if (roleAffiliationElement && config.site?.role?.affiliation) {
            roleAffiliationElement.textContent = config.site.role.affiliation;
        }
        
        // Update footer name
        const footerNameElement = document.getElementById('footer-name');
        if (footerNameElement && config.site?.footer_name) {
            footerNameElement.textContent = config.site.footer_name;
        }
    } catch (error) {
        console.error('Error loading site metadata:', error);
    }
}

/**
 * Load layout configuration for navigation and section titles
 * Updates navigation links, section headings, and footer content
 */
async function loadLayoutConfiguration() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        // Build navigation menu
        const navLinksElement = document.getElementById('nav-links');
        if (navLinksElement && config.layout?.header?.navigation) {
            // Preserve theme toggle button
            const themeButton = navLinksElement.querySelector('#theme-toggle');
            navLinksElement.innerHTML = '';
            
            // Add navigation links
            config.layout.header.navigation.forEach(navItem => {
                const linkElement = document.createElement('a');
                linkElement.href = navItem.href;
                linkElement.innerHTML = navItem.label;
                navLinksElement.appendChild(linkElement);
            });
            
            // Re-add theme toggle button
            if (themeButton) {
                navLinksElement.appendChild(themeButton);
            }
        }
        
        // Update section titles
        const updateSectionTitle = (elementId, title) => {
            const element = document.getElementById(elementId);
            if (element && title) {
                element.innerHTML = title;
            }
        };
        
        updateSectionTitle('publications-heading', config.layout?.sections?.publications?.title);
        updateSectionTitle('blog-heading', config.layout?.sections?.blog?.title);
        updateSectionTitle('media-heading', config.layout?.sections?.media?.title);
        
        // Update footer content
        const footerTaglineElement = document.getElementById('footer-tagline');
        const footerYearElement = document.getElementById('footer-year');
        const footerLicenseElement = document.getElementById('footer-license');
        
        if (footerTaglineElement && config.layout?.footer?.tagline) {
            footerTaglineElement.textContent = config.layout.footer.tagline;
        }
        if (footerYearElement && config.layout?.footer?.year) {
            footerYearElement.textContent = config.layout.footer.year;
        }
        if (footerLicenseElement && config.layout?.footer?.license_text) {
            const licenseUrl = config.layout.footer.license_url || '#';
            footerLicenseElement.href = licenseUrl;
            footerLicenseElement.textContent = config.layout.footer.license_text;
        }
    } catch (error) {
        console.error('Error loading layout configuration:', error);
    }
}

/**
 * Load profile content from config or fallback to bio.md
 * Converts markdown formatting to HTML for display
 */
async function loadProfileContent() {
    try {
        const config = await loadConfig();
        let markdownContent;
        
        if (config?.site?.profile) {
            // Use profile content from config
            markdownContent = config.site.profile;
        } else {
            // Fallback to bio.md file
            const bioResponse = await fetch('content/site/bio.md');
            markdownContent = await bioResponse.text();
        }
        
        // Convert markdown to HTML
        const htmlContent = convertSimpleMarkdownToHtml(markdownContent);
        const profileElement = document.getElementById('profile-content');
        if (profileElement) {
            profileElement.innerHTML = htmlContent;
        }
        
    } catch (error) {
        console.error('Error loading profile content:', error);
    }
}

/**
 * Load social links from config and create clickable icons
 * Handles both emoji and image-based social icons
 */
async function loadSocialLinks() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        const contacts = config.contacts;
        const socialsContainer = document.getElementById('profile-socials');
        
        if (!socialsContainer || !contacts) return;
        
        contacts.forEach(contact => {
            const socialLink = document.createElement('a');
            socialLink.href = contact.url;
            socialLink.target = '_blank';
            socialLink.className = 'social-link';
            socialLink.title = contact.name;
            
            if (contact.is_image) {
                socialLink.innerHTML = `<img src="${contact.icon}" alt="${contact.name}" class="social-icon-img">`;
            } else {
                socialLink.innerHTML = `<span class="social-icon">${contact.icon}</span>`;
            }
            
            socialsContainer.appendChild(socialLink);
        });
    } catch (error) {
        console.error('Error loading social links:', error);
    }
}

/**
 * Load publications from publications.json and render publication cards
 * Creates interactive publication entries with available resource buttons
 */
async function loadPublications() {
    try {
        const publications = await loadYaml('content/publications/publications.yaml');
        const listContainer = document.getElementById('publications-list');
        
        if (!listContainer || !publications) return;
        
        const publicationCards = publications.map(pub => {
            // Build buttons HTML for available resources
            const buttons = [
                { key: 'paper', label: 'Paper', url: pub.paper || pub.link },
                { key: 'code', label: 'Code', url: pub.code },
                { key: 'poster', label: 'Poster', url: pub.poster },
                { key: 'slides', label: 'Slides', url: pub.slides },
                { key: 'video', label: 'Video', url: pub.video },
                { key: 'demo', label: 'Demo', url: pub.demo }
            ];
            
            const availableButtons = buttons.filter(btn => btn.url);
            const buttonsHTML = availableButtons.length > 0
                ? '<div class="pub-buttons">' + 
                  availableButtons.map(btn => 
                      `<a href="${btn.url}" class="pub-button" target="_blank" onclick="event.stopPropagation()">${btn.label}</a>`
                  ).join('') + 
                  '</div>'
                : '';
            
            // Bold author name
            const formattedAuthors = pub.authors.replace(/\bF\. Fehr\b/g, '<strong>F. Fehr</strong>');
            
            return `
            <div class="publication" onclick="window.open('${pub.paper || pub.link}', '_blank')">
                <div class="pub-image">
                    <img src="${pub.image}" alt="${pub.title}">
                </div>
                <div class="pub-description">
                    <h2>${pub.title}</h2>
                    <p>${formattedAuthors}</p>
                    <p>${pub.venue}</p>
                    <p><b class='pub-conference'>${pub.conference}</b></p>
                    ${buttonsHTML}
                </div>
            </div>
            `;
        });
        
        listContainer.innerHTML = publicationCards.join('');
    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

/**
 * Load blog posts from blogs.json and create blog post previews
 * Renders blog cards with titles, dates, and excerpts
 */
async function loadBlogs() {
    try {
        const blogs = await loadYaml('content/blogs/blogs.yaml');
        const listContainer = document.getElementById('blog-list');
        
        if (!listContainer || !blogs) return;
        
        const blogCards = blogs.map(blog => {
            const formattedDate = formatDate(blog.date);
            
            return `
            <a href="blogs.html?id=${blog.id}" style="text-decoration:none;">
            <div class="blog-post">
                <div class="blog-image">
                    <img src="${blog.thumbnail}" alt="${blog.title}">
                </div>
                <div class="blog-description">
                    <h2>${blog.title}</h2>
                    <p class="blog-date">${formattedDate}</p>
                    <p>${blog.excerpt}</p>
                </div>
            </div>
            </a>
            `;
        });
        
        listContainer.innerHTML = blogCards.join('');
    } catch (error) {
        console.error('Error loading blogs:', error);
    }
}

/**
 * Load design configuration and apply CSS custom properties
 * Sets layout variables, typography, and image sizing from design.json
 */
async function loadDesignConfiguration() {
    try {
        const response = await fetch('content/site/design.json');
        if (!response.ok) return;
        const config = await response.json();
        
        // Layout variables
        if (config.layout?.maxWidth) {
            const value = config.layout.maxWidth.value;
            const unit = config.layout.maxWidth.unit || 'px';
            document.documentElement.style.setProperty('--maxw', value + unit);
        }
        
        // Typography variables
        if (config.typography?.body?.lineHeight) {
            document.documentElement.style.setProperty(
                '--body-line-height', 
                config.typography.body.lineHeight.value
            );
        }
        
        // Image variables
        const pubThumbnail = config.images?.publicationThumbnail;
        if (pubThumbnail) {
            const width = pubThumbnail.width?.value;
            const widthUnit = pubThumbnail.width?.unit || 'px';
            const height = pubThumbnail.height?.value;
            const heightUnit = pubThumbnail.height?.unit || 'px';
            const borderRadius = pubThumbnail.borderRadius || '4px';
            
            if (width) document.documentElement.style.setProperty('--pub-thumb-width', width + widthUnit);
            if (height) document.documentElement.style.setProperty('--pub-thumb-height', height + heightUnit);
            document.documentElement.style.setProperty('--pub-thumb-radius', borderRadius);
        }
    } catch (error) {
        console.error('Error loading design configuration:', error);
    }
}

/**
 * Initialize main page
 * Loads all content sections in the correct order
 */
function initializeMainPage() {
    // Load configurations first so CSS variables are available
    loadLayoutConfiguration();
    loadSiteMetadata();
    loadDesignConfiguration();
    
    // Load content
    loadProfileContent();
    loadSocialLinks();
    loadPublications();
    loadBlogs();
    loadTimeline();
    loadMedia();
}


/**
 * ===================================================================
 *                    BLOG PAGE FUNCTIONS (blogs.html)
 * ===================================================================
 */

/**
 * Load site metadata for blog page (simpler version)
 */
async function loadBlogSiteMetadata() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        const siteNameElement = document.getElementById('site-name');
        const footerNameElement = document.getElementById('footer-name');
        
        if (siteNameElement && config.site?.name) {
            siteNameElement.textContent = config.site.name;
        }
        if (footerNameElement && config.site?.footer_name) {
            footerNameElement.textContent = config.site.footer_name;
        }
    } catch (error) {
        console.error('Error loading site metadata:', error);
    }
}

/**
 * Load layout configuration for blog page (footer only)
 */
async function loadBlogLayoutConfiguration() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        const footerYearElement = document.getElementById('footer-year');
        const footerTaglineElement = document.getElementById('footer-tagline');
        const footerLicenseElement = document.getElementById('footer-license');
        
        if (footerYearElement && config.layout?.footer?.year) {
            footerYearElement.textContent = config.layout.footer.year;
        }
        if (footerTaglineElement && config.layout?.footer?.tagline) {
            footerTaglineElement.textContent = config.layout.footer.tagline;
        }
        if (footerLicenseElement && config.layout?.footer?.license_text) {
            const licenseUrl = config.layout.footer.license_url || '#';
            footerLicenseElement.href = licenseUrl;
            footerLicenseElement.textContent = config.layout.footer.license_text;
        }
    } catch (error) {
        console.error('Error loading layout configuration:', error);
    }
}

/**
 * Load and render a single blog post
 * Fetches blog content, parses markdown, and generates table of contents
 */
async function loadBlogPost() {
    try {
        // Get blog ID from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('id');
        
        const blogBodyElement = document.getElementById('blog-body');
        
        if (!blogId) {
            if (blogBodyElement) {
                blogBodyElement.innerHTML = '<p>No blog post specified.</p>';
            }
            return;
        }
        
        // Load blogs.yaml to find the content file
        const blogs = await loadYaml('content/blogs/blogs.yaml');
        
        const blog = blogs?.find(b => b.id === blogId);
        
        if (!blog) {
            if (blogBodyElement) {
                blogBodyElement.innerHTML = '<p>Blog post not found.</p>';
            }
            return;
        }
        
        // Set title and date
        const titleElement = document.getElementById('blog-title');
        const dateElement = document.getElementById('blog-date');
        const pageTitleElement = document.getElementById('page-title');
        
        if (titleElement) titleElement.textContent = blog.title;
        if (pageTitleElement) pageTitleElement.textContent = blog.title;
        if (dateElement) {
            dateElement.textContent = formatDate(blog.date);
        }
        
        // Load and parse content file
        let htmlContent;
        if (blog.content_file) {
            // Load JSON content
            const contentResponse = await fetch(blog.content_file);
            const contentData = await contentResponse.json();
            htmlContent = parseMarkdown(contentData.content);
        } else if (blog.markdown_file) {
            // Legacy: Load markdown file (for backward compatibility)
            const markdownResponse = await fetch(blog.markdown_file);
            const markdownText = await markdownResponse.text();
            htmlContent = parseMarkdown(markdownText);
        } else {
            throw new Error('No content file specified');
        }
        
        if (blogBodyElement) {
            blogBodyElement.innerHTML = htmlContent;
            
            // Fix relative image paths for blog content
            // Images in markdown are relative to content/blogs/ directory
            // but blogs.html is at root, so we need to prepend the path
            const images = blogBodyElement.querySelectorAll('img');
            images.forEach(img => {
                const src = img.getAttribute('src');
                // Only fix relative paths that don't already include content/blogs/
                if (src && !src.startsWith('http') && !src.startsWith('/') && !src.includes('content/blogs/')) {
                    img.setAttribute('src', `content/blogs/${src}`);
                }
            });
        }
        
        // Generate table of contents
        generateTableOfContents();
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        const blogBodyElement = document.getElementById('blog-body');
        if (blogBodyElement) {
            blogBodyElement.innerHTML = '<p>Error loading blog post.</p>';
        }
    }
}

/**
 * Generate table of contents from h2 and h3 headings in blog post
 * Creates interactive TOC with scroll highlighting
 */
function generateTableOfContents() {
    const blogBody = document.getElementById('blog-body');
    const tocList = document.getElementById('toc-list');
    const blogToc = document.getElementById('blog-toc');
    
    if (!blogBody || !tocList) return;
    
    const headings = blogBody.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
        if (blogToc) {
            blogToc.style.display = 'none';
        }
        return;
    }
    
    headings.forEach((heading, index) => {
        // Add ID to heading for anchor linking
        const id = `section-${index}`;
        heading.id = id;
        
        // Create TOC item
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        
        // Indent h3 items
        if (heading.tagName === 'H3') {
            listItem.style.paddingLeft = '12px';
            link.style.fontSize = '13px';
        }
        
        link.addEventListener('click', (event) => {
            event.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', `#${id}`);
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    // Highlight active section on scroll
    let activeLink = null;
    window.addEventListener('scroll', () => {
        let current = '';
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
                current = heading.id;
            }
        });
        
        if (current && current !== activeLink) {
            tocList.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
            activeLink = current;
        }
    });
}

/**
 * Initialize blog page
 * Loads metadata and blog post content
 */
function initializeBlogPage() {
    loadBlogLayoutConfiguration();
    loadBlogSiteMetadata();
    loadBlogPost();
}


/**
 * ===================================================================
 *                    PAGE DETECTION AND INITIALIZATION
 * ===================================================================
 */

// Initialize the appropriate page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeThemeToggle();
        
        // Detect which page we're on
        if (document.getElementById('blog-body')) {
            // We're on the blog detail page
            initializeBlogPage();
        } else if (document.getElementById('profile-content')) {
            // We're on the main page
            initializeMainPage();
        }
    });
} else {
    initializeThemeToggle();
    
    // Detect which page we're on
    if (document.getElementById('blog-body')) {
        initializeBlogPage();
    } else if (document.getElementById('profile-content')) {
        initializeMainPage();
    }
}

})(); // End of IIFE
