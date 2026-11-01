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
     *                    POSTHOG CONFIGURATION
     * ===================================================================
     * Used only to capture the "toast this post" like click as an event
     * (blog_liked, with a post_id property). Autocapture/pageview capture
     * are left off — this is a minimal, single-purpose integration, not
     * general site analytics. The displayed count is read from a static
     * JSON file (content/site/blog-likes.json) baked daily by a GitHub
     * Action that queries these events — see .github/workflows/update-like-counts.yml.
     * Optional: set site.posthog in config.yaml; without it the like button is hidden.
     */
    const BLOG_LIKES_JSON = '../content/site/blog-likes.json';

    function initPostHog(ph) {
        // PostHog loader snippet (official minimal loader — lazy-loads the real
        // library from PostHog's CDN on first use, defines window.posthog).
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.uploadQueue=t.uploadQueue||[],t.uploadQueue.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSurveysWaitingWithData syncWithPHVersion".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        window.posthog.init(ph.key, {
            api_host: ph.host || 'https://eu.posthog.com',
            autocapture: false,
            capture_pageview: false,
            disable_session_recording: true,
            persistence: 'memory', // no cookie or storage: each like is an anonymous one-off event
        });
    }

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
            // Determine the correct path based on current location
            const configPath = window.BLOG_POST_ID ? '../content/site/config.yaml' : 'content/site/config.yaml';
            const response = await fetch(configPath);
            const yamlText = await response.text();
            siteConfig = jsyaml.load(yamlText);
            return siteConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            return null;
        }
    }

    /**
     * Apply the active colour palette from config to CSS custom properties.
     * Sets four palette vars on :root — the theme blocks (light/dark) reference
     * these via var(), so the theme toggle continues to work automatically.
     */
    async function applyPalette() {
        const config = await loadConfig();
        const colors = config?.design?.colors;
        if (!colors) return;

        const palette = colors.palettes?.[colors.active_palette];
        if (!palette) return;

        const root = document.documentElement;
        root.style.setProperty('--palette-light-link',  palette.light.link);
        root.style.setProperty('--palette-light-hover', palette.light.hover);
        root.style.setProperty('--palette-dark-link',   palette.dark.link);
        root.style.setProperty('--palette-dark-hover',  palette.dark.hover);
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
        // Date-only strings parse as UTC midnight; format in UTC so western time zones don't show the day before
        return new Date(dateString).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
    }

    /**
     * Apply inline markdown formatting (bold, italic, links)
     * Used for single-line text like titles and descriptions
     * @param {string} text - Text with markdown formatting
     * @returns {string} HTML formatted text
     */
    function formatInlineMarkdown(text) {
        return text
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')  // Links
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(\S[^*]*?)\*/g, '<em>$1</em>');  // Italic (not "* " bullets)
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

    // Replace {{TOC}} placeholder with a DOM anchor the TOC generator will find
    markdown = markdown.replace(/\{\{TOC\}\}/g, '<div id="toc-placeholder"></div>');

    let html = markdown;
    
    // Parse headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Parse links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Parse bold **text** or __text__
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Parse italic *text*
    html = html.replace(/\*(\S[^*]*?)\*/g, '<em>$1</em>'); // not "* " bullets
    
    // Parse lists - handle both unordered (-) and ordered (1.)
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
        block = block.trim();
        if (!block) return '';
        
        // Check for unordered list (lines starting with - or *)
        const isUnorderedList = block.split('\n').every(line => 
            line.trim().match(/^[-*]\s/) || line.trim() === ''
        );
        
        if (isUnorderedList && block.match(/^[-*]\s/m)) {
            const listItems = block.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const match = line.match(/^[-*]\s+(.+)$/);
                    return match ? `<li>${match[1]}</li>` : '';
                })
                .join('\n');
            return `<ul>\n${listItems}\n</ul>`;
        }
        
        // Check for ordered list (lines starting with numbers)
        const isOrderedList = block.split('\n').every(line => 
            line.trim().match(/^\d+\.\s/) || line.trim() === ''
        );
        
        if (isOrderedList && block.match(/^\d+\.\s/m)) {
            const listItems = block.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const match = line.match(/^\d+\.\s+(.+)$/);
                    return match ? `<li>${match[1]}</li>` : '';
                })
                .join('\n');
            return `<ol>\n${listItems}\n</ol>`;
        }
        
        // Don't wrap if it's already an HTML tag
        if (block.startsWith('<h') || block.startsWith('<figure') ||
            block.startsWith('<ul') || block.startsWith('<ol') ||
            block.startsWith('<div') || block.startsWith('</')) {
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
        themeToggle.blur();
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
            const startYear = startDate.getUTCFullYear();
            
            let endYear = '';
            if (item.end_date) {
                if (item.end_date.toLowerCase() === 'present') {
                    endYear = 'Present';
                } else {
                    const endDate = new Date(item.end_date);
                    endYear = endDate.getUTCFullYear();
                }
            }
            
            const yearRange = endYear === startYear ? `${startYear}` : endYear ? `${startYear} - ${endYear}` : `${startYear} -`;
            
            // Same markdown parser as blog posts: paragraphs, bullet lists, bold, italic, links
            const formattedDescription = parseMarkdown(item.description || '');

            // Optional dark-mode logo swaps in via the shared .img-light/.img-dark rules
            const imgHTML = item.logo_dark
                ? `<img src="${item.logo}" alt="${item.organization} logo" class="timeline-logo img-light"><img src="${item.logo_dark}" alt="${item.organization} logo" class="timeline-logo img-dark">`
                : `<img src="${item.logo}" alt="${item.organization} logo" class="timeline-logo">`;

            // Make logo clickable if URL exists
            const logoHTML = item.url
                ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="timeline-logo-link">${imgHTML}</a>`
                : imgHTML;
            
            return `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-year">${yearRange}</div>
                ${logoHTML}
                <div class="timeline-content">
                    <div class="timeline-description">${formattedDescription}</div>
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
/**
 * Build one highlight card: an embedded YouTube player with title and description.
 * Used by the Highlights grid and by video sub-cards under a highlighted project.
 */
function mediaCard(item) {
    const videoUrl = item.timestamp
        ? `https://www.youtube.com/embed/${item.video_id}?start=${item.timestamp}`
        : `https://www.youtube.com/embed/${item.video_id}`;

    return `
            <div class="media-item">
                <div class="media-thumbnail${item.vertical ? ' vertical' : ''}">
                    <iframe 
                        src="${videoUrl}" 
                        title="${item.title}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="media-info">
                    <h3>${formatInlineMarkdown(item.title)}</h3>
                    <p>${formatInlineMarkdown(item.description || '')}</p>
                </div>
            </div>
            `;
}

async function loadMedia() {
    try {
        const mediaItems = await loadYaml('content/media/media.yaml');
        
        const container = document.getElementById('media-list');
        if (!container || !mediaItems) return;
        
        container.innerHTML = mediaItems.map(mediaCard).join('');
        
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
        
        // Update profile picture
        const profileImgElement = document.getElementById('profile-img');
        if (profileImgElement && config.site?.profile_picture_path) {
            profileImgElement.src = config.site.profile_picture_path;
        }

        // Optional photo effects: theme filters (read by CSS) and a dark-mode overlay
        const effects = config.site?.profile_picture_effects;
        const profilePhoto = document.getElementById('profile-photo');
        if (profilePhoto && effects) {
            if (effects.light_filter) profilePhoto.style.setProperty('--photo-filter-light', effects.light_filter);
            if (effects.dark_filter) profilePhoto.style.setProperty('--photo-filter-dark', effects.dark_filter);
            const overlay = effects.dark_overlay;
            if (overlay?.src) {
                const img = document.createElement('img');
                img.className = 'profile-overlay';
                img.src = overlay.src;
                img.alt = '';
                img.style.left = overlay.left || '0';
                img.style.top = overlay.top || '0';
                img.style.width = overlay.width || '100%';
                img.style.setProperty('--overlay-rotate', overlay.rotate || '0deg');
                profilePhoto.appendChild(img);
            }
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
            navLinksElement.innerHTML = '';

            config.layout.header.navigation.forEach(navItem => {
                const linkElement = document.createElement('a');
                let href = navItem.href;

                // Replace {{cv_path}} placeholder with actual CV URL
                if (href.includes('{{cv_path}}')) {
                    if (!config.site?.cv_path) return; // no CV set: no CV link
                    href = href.replace('{{cv_path}}', config.site.cv_path);
                }

                linkElement.href = href;
                linkElement.innerHTML = navItem.label;

                // Add target="_blank" for external links (like CV)
                if (navItem.is_external) {
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener noreferrer';
                }

                navLinksElement.appendChild(linkElement);
            });
            initNavHighlight();
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
        
        // Update blog subtitle
        const blogSubtitleElement = document.getElementById('blog-subtitle');
        if (blogSubtitleElement && config.layout?.sections?.blog?.subtitle) {
            blogSubtitleElement.textContent = config.layout.sections.blog.subtitle;
        }
        
        // Update publications note with Google Scholar link
        const publicationsNoteElement = document.querySelector('.publications-note');
        if (publicationsNoteElement && config.layout?.sections?.publications?.note && config.site?.google_scholar_url) {
            const noteHtml = config.layout.sections.publications.note.replace('{{google_scholar_url}}', config.site.google_scholar_url);
            publicationsNoteElement.innerHTML = noteHtml;
        }
        
        // Update footer content
        const footerTaglineElement = document.getElementById('footer-tagline');
        const footerYearElement = document.getElementById('footer-year');
        const footerLicenseElement = document.getElementById('footer-license');
        
        if (footerTaglineElement && config.layout?.footer?.tagline) {
            footerTaglineElement.textContent = config.layout.footer.tagline;
        } else if (footerTaglineElement) {
            footerTaglineElement.remove(); // optional: no tagline, no line
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
        
        // Same markdown parser as the timeline and blog posts (paragraphs, lists, bold, italic, links)
        const htmlContent = parseMarkdown(markdownContent);
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
            socialLink.rel = 'noopener noreferrer';
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
        const config = await loadConfig();
        const publications = await loadYaml('content/publications/publications.yaml');
        const listContainer = document.getElementById('publications-list');
        
        if (!listContainer || !publications) return;
        
        const publicationCards = publications.map(pub => {
            // Build buttons HTML for available resources
            const buttons = [
                { key: 'paper', label: 'Paper', url: pub.paper || pub.link },
                { key: 'website', label: 'Website', url: pub.website },
                { key: 'code', label: 'Code', url: pub.code },
                { key: 'dataset', label: 'Dataset', url: pub.dataset },
                { key: 'poster', label: 'Poster', url: pub.poster },
                { key: 'slides', label: 'Slides', url: pub.slides },
                { key: 'video', label: 'Video', url: pub.video },
                { key: 'demo', label: 'Demo', url: pub.demo }
            ];
            
            const availableButtons = buttons.filter(btn => btn.url);
            const buttonsHTML = availableButtons.length > 0
                ? '<div class="pub-buttons">' + 
                  availableButtons.map(btn => 
                      `<a href="${btn.url}" class="pub-button" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${btn.label}</a>`
                  ).join('') + 
                  '</div>'
                : '';
            
            // Bold author name using pattern from config (none set: nothing bolded)
            const authorPattern = config?.site?.author_name_pattern;
            const formattedAuthors = authorPattern
                ? pub.authors.replace(new RegExp(`\\b${authorPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), `<strong>${authorPattern}</strong>`)
                : pub.authors;
            
            return `
            <div class="publication"${(pub.paper || pub.link) ? ` onclick="window.open('${pub.paper || pub.link}', '_blank', 'noopener,noreferrer')"` : ''}>
                <div class="pub-image">
                    ${pub.image_dark
                        ? `<img class="img-light" src="${pub.image}" alt="${pub.title} thumbnail"><img class="img-dark" src="${pub.image_dark}" alt="${pub.title} thumbnail">`
                        : `<img src="${pub.image}" alt="${pub.title} thumbnail">`}
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
 * Load highlighted projects from projects.yaml into the top of the Highlights section
 * (card format ported from Karl El Hajal's site, karlhajal.com). Each project is a linked card;
 * optional `children` render underneath as linked cards or, with a video_id, as video cards.
 */
async function loadProjects() {
    try {
        const projects = await loadYaml('content/projects/projects.yaml');
        const list = document.getElementById('projects-list');
        if (!list || !projects) return;

        list.innerHTML = projects.map(project => {
            const imageHTML = project.image
                ? `<div class="pub-image"><img src="${project.image}" alt="${project.title} thumbnail" loading="lazy" decoding="async"></div>`
                : '';
            const period = project.period ? `<p><b class="pub-conference">${project.period}</b></p>` : '';
            const badge = project.badge ? `<p><b class="pub-conference">${project.badge}</b></p>` : '';
            // Children with a video_id become embedded highlight cards (own row); the rest are linked cards
            const videos = (project.children || []).filter(child => child.video_id).map(mediaCard).join('');
            const children = (project.children || []).filter(child => !child.video_id).map(child => `
                <a class="project-child" href="${child.url}" target="_blank" rel="noopener noreferrer">
                    ${child.image ? `<img class="project-child-img" width="100" height="167" src="${child.image}" alt="${child.title} on a phone" loading="lazy">` : ''}
                    <div>
                        <h2>${child.title}</h2>
                        <p>${formatInlineMarkdown(child.summary || '')}</p>
                    </div>
                </a>`).join('');
            const childrenHTML = (videos || children)
                ? `<div class="project-children">${project.children_label ? `<p class="project-children-label">${project.children_label}</p>` : ''}${videos ? `<div class="project-children-grid">${videos}</div>` : ''}${children ? `<div class="project-children-grid">${children}</div>` : ''}</div>`
                : '';
            const cardInner = `
                    ${imageHTML}
                    <div class="pub-description">
                        <h2>${project.title}</h2>
                        <p>${formatInlineMarkdown(project.summary || '')}</p>
                        ${period}${badge}
                    </div>`;
            const card = project.url
                ? `<a class="publication project" href="${project.url}" target="_blank" rel="noopener noreferrer">${cardInner}</a>`
                : `<div class="publication project is-static">${cardInner}</div>`;
            return `
            <div class="project-group">
                ${card}
                ${childrenHTML}
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

/**
 * Load blog posts from blogs.json and create blog post previews
 * Renders blog cards with titles, dates, and excerpts
 */
async function loadBlogs() {
    try {
        const blogs = await loadYaml('blogs/blogs.yaml');
        const listContainer = document.getElementById('blog-list');
        
        if (!listContainer || !blogs) return;

        const blogCards = blogs.filter(blog => !blog.hidden).map(blog => {
            const formattedDate = formatDate(blog.date);
            const dateLine = formattedDate + (blog.reading_time ? ' · ' + blog.reading_time : '');

            return `
            <a href="blogs/${blog.id}.html" style="text-decoration:none;">
            <div class="blog-post">
                <div class="blog-image">
                    <img src="${blog.thumbnail}" alt="${blog.title} cover image">
                </div>
                <div class="blog-description">
                    <h2>${blog.title}</h2>
                    <p class="blog-date">${dateLine}</p>
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
 * Initialize main page
 * Loads all content sections in the correct order
 */
function initNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length) return;

    const sectionIds = [...navLinks].map(a => a.getAttribute('href').slice(1));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    let suppressHighlight = false;

    function updateActiveLink() {
        if (suppressHighlight) return;
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')) || 100;
        let current = null;
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= offset + 8) {
                current = section.id;
            }
        });
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            suppressHighlight = true;
            navLinks.forEach(a => a.classList.remove('active'));
            link.blur();
            setTimeout(() => { suppressHighlight = false; }, 800);
        });
    });

    document.body.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

/**
 * Optional hero background: a living ASCII scene (an ascii.rest piece) behind the header and profile.
 * Everything lives in js/background/: background.json (its settings), the scene module and engine.js. No
 * background.json, no background: the template ships background.example.json and example.js to start from.
 * ascii.rest pauses the scene off-screen and in hidden tabs, and holds a still frame under
 * prefers-reduced-motion. On top of that it loads only once the page is idle, runs at a lower frame
 * rate on phones and weaker devices, and stays still when the visitor asks to save data.
 */
const ASCII_REST = 'https://cdn.jsdelivr.net/npm/ascii.rest@0.4.0/dist/ascii.js';

async function initHeroBackground() {
    const main = document.querySelector('main');
    const profile = document.querySelector('.profile-section');
    if (!main || !profile) return;
    let bg;
    try {
        const res = await fetch('js/background/background.json');
        if (!res.ok) return;
        bg = await res.json();
    } catch (error) {
        return;
    }
    if (!bg || !/^[a-z0-9-]+$/.test(bg.scene || '')) return;
    const themes = bg.themes || ['dark'];
    const [cols, rows] = bg.grid || [200, 100]; // the scene's cells, as in its meta
    const root = document.documentElement;

    const layer = document.createElement('div');
    layer.className = 'hero-bg';
    layer.setAttribute('aria-hidden', 'true');
    main.prepend(layer);

    const weak = matchMedia('(max-width: 720px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
    const saveData = navigator.connection && navigator.connection.saveData;
    const fps = saveData ? 0 : weak ? (bg.fps_small || 15) : (bg.fps || 24);

    // Cover from the top of the page to just below the profile (on a narrow screen only down past the
    // photo, so a long bio does not blow the scene up), and draw the canvas at the size it shows, so it
    // stays sharp and no bigger than needed. It is cropped so the scene's focus column sits behind the
    // profile photo.
    const wide = matchMedia('(min-width: 721px)');
    const fit = () => {
        const photo = document.getElementById('profile-img');
        const W = layer.clientWidth;
        // Place the scene's focus cell (focus_column, focus_row) at the
        // photo's centre. The cells are as small as the width allows (zoomed out): the canvas covers the
        // layer's width, and may start below its top, where the fade-in moves with it.
        const fc = (bg.focus_column ?? 40) + 0.5, fr = (bg.focus_row ?? 44) + 0.5;
        let cx = W / 2;
        if (photo) {
            const p = photo.getBoundingClientRect();
            cx = p.left + p.width / 2 - layer.getBoundingClientRect().left;
        }
        // zoom < 1 shows more of the scene; the edge clamp below then slides the focus off the photo
        const cell = Math.max(W / cols, Math.max(cx / fc, (W - cx) / (cols - fc)) * (bg.zoom || 1));
        // With photo_row set, the scene hangs from the top bar and the profile moves down to start at that
        // scene row (below the horizon), so the scene shows above the photo instead of behind it
        // (photo_row_wide, when set, above 720px)
        const row = (wide.matches && bg.photo_row_wide != null) ? bg.photo_row_wide : bg.photo_row;
        const stacked = row != null;
        profile.style.setProperty('--hero-photo-top', stacked ? row * cell + 'px' : '');
        const photoBottom = photo ? photo.getBoundingClientRect().bottom - main.getBoundingClientRect().top : 0;
        // the scene starts below the top bar, which stays solid above it
        const head = main.querySelector('.header');
        const top0 = head ? head.offsetHeight : 0; // not offsetTop: the bar is sticky, so that grows with scrolling
        let H = Math.min(profile.offsetTop + profile.offsetHeight + 40, Math.max(W * 0.6, photoBottom + 120)) - top0;
        if (stacked) H = Math.min(H, rows * cell); // end the fade-out where the scene ends, not below it

        layer.style.top = top0 + 'px';
        layer.style.height = H + 'px';
        const canvas = layer.querySelector('canvas');
        if (!canvas) return;
        let cy = H / 2;
        if (photo) {
            const p = photo.getBoundingClientRect();
            cy = p.top + p.height / 2 - layer.getBoundingClientRect().top;
        }
        const left = Math.min(0, Math.max(W - cols * cell, cx - fc * cell));
        const top = stacked ? 0 : cy - fr * cell;
        canvas.style.width = cols * cell + 'px';
        canvas.style.height = rows * cell + 'px';
        canvas.style.left = left + 'px';
        canvas.style.top = top + 'px';
        layer.style.setProperty('--scene-top', Math.max(0, top) + 'px');
    };

    // ?bg-hour=19.5 previews another time of day (the scene follows the visitor's clock otherwise)
    const hourParam = parseFloat(new URLSearchParams(location.search).get('bg-hour'));
    // The scene's clock (bg.timezone, e.g. "Europe/Zurich"), so "now" is the same moment for every
    // visitor; without one, the visitor's own clock
    const clockHour = () => {
        const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: bg.timezone || undefined, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
            .format(new Date()).split(':').map(Number);
        return h + m / 60;
    };
    let sceneHour = hourParam >= 0 && hourParam < 24 ? hourParam : clockHour();
    // The brand colour follows the scene's light (bg.accents: [from hour, light-theme colour, dark-theme colour]);
    // !important beats the config palette, which is set inline on <html> whenever it loads
    const accentStyle = document.head.appendChild(document.createElement('style'));
    const setAccent = () => {
        const a = (bg.accents || []).filter(([from]) => from <= sceneHour).pop();
        accentStyle.textContent = a ? `html.has-hero-bg {
            --palette-light-link: ${a[1]} !important;
            --palette-light-hover: color-mix(in srgb, ${a[1]} 10%, var(--bg-color)) !important;
            --palette-dark-link: ${a[2]} !important;
            --palette-dark-hover: color-mix(in srgb, ${a[2]} 15%, var(--bg-color)) !important;
        }` : '';
    };
    setAccent();
    // a new hour restarts the scene (it reads its options once)
    const setHour = (h) => {
        sceneHour = h;
        setAccent();
        if (art) art.remove();
        art = null;
        update();
    };

    // On in the listed themes only; removing the element stops its animation
    let art = null;
    const update = () => {
        const on = themes.includes(root.getAttribute('data-theme'));
        root.classList.toggle('has-hero-bg', on);
        if (on && !art) {
            art = document.createElement('ascii-art');
            art.setAttribute('src', `js/background/${bg.scene}.js`);
            art.setAttribute('fps', String(fps));
            art.setAttribute('options', JSON.stringify({ hour: sceneHour }));
            layer.appendChild(art);
        } else if (!on && art) {
            art.remove();
            art = null;
        }
    };

    const start = () => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = ASCII_REST;
        document.head.appendChild(script);
        update();
        new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        new MutationObserver(fit).observe(layer, { childList: true, subtree: true }); // the canvas arrives once loaded
        new ResizeObserver(fit).observe(profile);
        window.addEventListener('resize', fit);
        fit();
        footerScene();
    };

    // The footer echoes the scene: its horizon band (bg.footer_band: first row, row count), copied from the hero's
    // canvas while the footer is on screen, a caption for the hour (bg.captions: [from hour, text], in order), and a
    // row of presets with the scene's now (bg.presets: [label, hour]); each load starts at the scene's now
    const footerScene = () => {
        const footer = document.querySelector('footer');
        if (!footer) return;
        const wrap = document.createElement('div');
        wrap.className = 'footer-scene';
        wrap.setAttribute('aria-hidden', 'true');
        const out = document.createElement('canvas');
        out.width = out.height = 0;
        wrap.appendChild(out);
        footer.prepend(wrap);
        const caption = document.createElement('p');
        caption.className = 'footer-scene-caption';
        const fmt = (h) => {
            const m = Math.round(h * 60) % 1440;
            return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        };
        const time = document.createElement('div');
        time.className = 'scene-time';
        time.innerHTML = `
            <div class="scene-time-presets" role="group" aria-label="Time of day${bg.place ? ' in ' + bg.place : ''}">
                <button type="button" data-hour="now">Now<small></small></button>
                ${(bg.presets || []).map(([label, h]) => `<button type="button" data-hour="${h}">${label}<small>${fmt(h)}</small></button>`).join('')}
            </div>`;
        // an optional line above the scene (bg.footer_note; **bold** and *italic* work)
        if (bg.footer_note) {
            const note = document.createElement('p');
            note.className = 'footer-scene-note';
            note.innerHTML = formatInlineMarkdown(bg.footer_note);
            wrap.before(note);
        }
        wrap.after(caption, time);
        let live = !(hourParam >= 0 && hourParam < 24);
        const show = () => {
            time.querySelector('[data-hour="now"] small').textContent = fmt(clockHour());
            const c = (bg.captions || []).filter(([from]) => from <= sceneHour).pop();
            caption.textContent = c ? c[1] : '';
            time.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed',
                String(b.dataset.hour === 'now' ? live : !live && Number(b.dataset.hour) === sceneHour)));
        };
        time.querySelector('.scene-time-presets').addEventListener('click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            live = b.dataset.hour === 'now';
            setHour(live ? clockHour() : Number(b.dataset.hour));
            show();
        });
        show();
        const [bandTop, bandRows] = bg.footer_band || [44, 42];
        let visible = false, last = 0;
        const copy = (t = 0) => {
            if (!visible) return;
            requestAnimationFrame(copy);
            const src = layer.querySelector('canvas');
            if (t - last < 1000 / (fps || 1) || !src || !src.width || !root.classList.contains('has-hero-bg')) return;
            last = t;
            const w = Math.round(out.clientWidth * devicePixelRatio), hgt = Math.round((w * bandRows) / cols);
            if (out.width !== w || out.height !== hgt) (out.width = w), (out.height = hgt);
            out.getContext('2d').drawImage(src, 0, (src.height * bandTop) / rows, src.width, (src.height * bandRows) / rows, 0, 0, w, hgt);
        };
        new IntersectionObserver(([entry]) => {
            const was = visible;
            visible = entry.isIntersecting;
            if (visible && !was) requestAnimationFrame(copy);
        }).observe(footer);
    };
    start(); // at once: waiting for load and idle showed the plain layout first, then jumped
}

function initializeMainPage() {
    // Load configurations first so CSS variables are available
    loadLayoutConfiguration();
    loadSiteMetadata();
    initHeroBackground();

    // Load content
    loadProfileContent();
    loadSocialLinks();
    loadPublications();
    loadProjects();
    loadBlogs();
    loadTimeline();
    loadMedia();
}


    /**
     * ===================================================================
     *                    BLOG PAGE FUNCTIONS
     * ===================================================================
     *//**
 * Load site metadata for blog page (simpler version)
 */
async function loadBlogSiteMetadata() {
    try {
        const config = await loadConfig();
        if (!config) return;
        
        const footerNameElement = document.getElementById('footer-name');

        if (footerNameElement && config.site?.footer_name) {
            footerNameElement.textContent = config.site.footer_name;
        }
    } catch (error) {
        console.error('Error loading site metadata:', error);
    }
}

/**
 * Load and render a single blog post
 * Fetches blog content, parses markdown, and generates table of contents
 */
async function loadBlogPost() {
    try {
        // Set by convert-blog.py in each generated blogs/<id>.html page
        const blogId = window.BLOG_POST_ID;
        const blogBodyElement = document.getElementById('blog-body');
        
        if (!blogId) {
            if (blogBodyElement) {
                blogBodyElement.innerHTML = '<p>No blog post specified.</p>';
            }
            return;
        }
        
        // Blog pages live in blogs/, next to blogs.yaml
        const blogs = await loadYaml('blogs.yaml');
        
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
        // the blog's name (layout.sections.blog.title) in the tab, else the post title
        const blogName = (await loadConfig())?.layout?.sections?.blog?.title;
        if (pageTitleElement) pageTitleElement.textContent = blogName || blog.title;
        wireShareButtons(blog.title);
        const headerTitleElement = document.getElementById('blog-header-title');
        if (headerTitleElement) {
            headerTitleElement.textContent =
                (window.BLOG_POST_DATA && window.BLOG_POST_DATA.short_title)
                    ? window.BLOG_POST_DATA.short_title
                    : blog.title;
        }
        if (dateElement) {
            const readingTime = blog.reading_time || (window.BLOG_POST_DATA && window.BLOG_POST_DATA.reading_time);
            dateElement.textContent = formatDate(blog.date) + (readingTime ? ' · ' + readingTime : '');
        }
        
        // Content is embedded in the page by convert-blog.py
        if (!window.BLOG_POST_DATA) throw new Error('No content available');
        if (blogBodyElement) {
            blogBodyElement.innerHTML = parseMarkdown(window.BLOG_POST_DATA.content);
        }
        
        // Generate table of contents
        generateTableOfContents();

        // Initialize like button
        await initSunLike(blogId);

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
    const headerNav = document.getElementById('blog-header-nav');
    if (!blogBody) return;

    const headings = blogBody.querySelectorAll('h2, h3');

    // Assign IDs and group by h2
    const groups = [];
    let currentGroup = null;
    headings.forEach((heading, index) => {
        heading.id = `section-${index}`;
        if (heading.tagName === 'H2') {
            currentGroup = { h2: heading, h3s: [] };
            groups.push(currentGroup);
        } else {
            if (!currentGroup) { currentGroup = { h2: null, h3s: [] }; groups.push(currentGroup); }
            currentGroup.h3s.push(heading);
        }
    });

    // --- INLINE TOC (h2s only, only when {{TOC}} placeholder present) ---
    const h2Headings = [...headings].filter(h => h.tagName === 'H2');
    const tocPlaceholder = blogBody.querySelector('#toc-placeholder');
    if (tocPlaceholder && h2Headings.length > 0) {
        const inlineToc = document.createElement('div');
        inlineToc.className = 'blog-inline-toc';
        inlineToc.id = 'blog-inline-toc';
        inlineToc.innerHTML = '<h3 class="blog-toc-heading">Table of Contents</h3>';
        const ul = document.createElement('ul');
        h2Headings.forEach(h2 => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${h2.id}`;
            a.textContent = h2.textContent;
            a.addEventListener('click', e => {
                e.preventDefault();
                h2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', `#${h2.id}`);
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        inlineToc.appendChild(ul);
        tocPlaceholder.replaceWith(inlineToc);
    } else {
        // No {{TOC}} — remove orphaned placeholder if present
        if (tocPlaceholder) tocPlaceholder.remove();
    }

    // --- READING PROGRESS PILL ---
    const progressPill = document.createElement('div');
    progressPill.className = 'blog-progress';
    progressPill.id = 'blog-progress';
    document.body.appendChild(progressPill);

    // --- CURRENT SECTION INDICATOR ---
    if (headerNav) {
        const h2Indicator = document.createElement('span');
        h2Indicator.className = 'blog-current-h2';
        h2Indicator.id = 'blog-current-section'; // keep for any external refs

        const h3Indicator = document.createElement('span');
        h3Indicator.className = 'blog-current-h3';

        headerNav.appendChild(h2Indicator);
        headerNav.appendChild(h3Indicator);

        document.body.addEventListener('scroll', () => {
            let currentH2 = null;
            let currentH3 = null;
            headings.forEach(h => {
                if (h.getBoundingClientRect().top <= 120) {
                    if (h.tagName === 'H2') {
                        currentH2 = h;
                        currentH3 = null; // reset subsection when entering a new section
                    } else if (h.tagName === 'H3') {
                        currentH3 = h;
                    }
                }
            });
            h2Indicator.textContent = currentH2 ? currentH2.textContent : '';
            h3Indicator.textContent = currentH3 ? currentH3.textContent : '';
            headerNav.style.display = currentH2 ? '' : 'none';

            const pct = Math.round(
                document.body.scrollTop / (document.body.scrollHeight - document.body.clientHeight) * 100
            );
            progressPill.textContent = pct + '%';
            progressPill.style.setProperty('--fill', pct + '%');
            progressPill.classList.toggle('visible', pct > 0);
        });

        // Set initial state (hidden until scrolling begins)
        headerNav.style.display = 'none';
    }
}

/**
 * Wire share buttons with the current page URL and post title
 */
function wireShareButtons(title) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);

    const li = document.getElementById('share-linkedin');
    const x  = document.getElementById('share-x');
    const em = document.getElementById('share-email');
    const wa = document.getElementById('share-whatsapp');

    if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    if (x)  x.href  = `https://x.com/intent/tweet?url=${url}&text=${text}`;
    if (em) em.href = `mailto:?subject=${text}&body=${url}`;
    if (wa) wa.href = `https://wa.me/?text=${text}%20${url}`;
}

/**
 * ===================================================================
 *                    SUN LIKE BUTTON
 * ===================================================================
 */

/**
 * Initialize the sun like button for a blog post.
 * Reads the baseline count from the static blog-likes.json (baked daily by
 * a GitHub Action from PostHog data), handles click (optimistic increment +
 * posthog.capture), and persists liked state in localStorage.
 * @param {string} postId - The blog post ID
 */
async function initSunLike(postId) {
    const btn   = document.getElementById('sun-like-btn');
    const count = document.getElementById('sun-like-count');
    if (!btn || !count) return;

    const ph = (await loadConfig())?.site?.posthog;
    if (!ph?.key) {
        document.getElementById('blog-sun-like')?.style.setProperty('display', 'none');
        return;
    }
    initPostHog(ph);

    const storageKey = `liked:${postId}`;
    const alreadyLiked = localStorage.getItem(storageKey) === '1';

    // Fetch baseline count (as of the last daily bake)
    try {
        const res = await fetch(BLOG_LIKES_JSON);
        if (res.ok) {
            const likes = await res.json();
            const n = likes[postId] || 0;
            count.textContent = n > 0 ? n : '';
        }
    } catch (_) { /* network error — show no count */ }

    if (alreadyLiked) {
        btn.classList.add('liked');
        btn.disabled = true;
    }

    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.classList.add('liked');
        localStorage.setItem(storageKey, '1');

        // Optimistic increment — the real baseline catches up on the next
        // daily bake from PostHog, this is just immediate feedback.
        const prev = parseInt(count.textContent, 10) || 0;
        count.textContent = prev + 1;

        try {
            if (window.posthog) {
                window.posthog.capture('blog_liked', { post_id: postId });
            }
        } catch (_) { /* posthog blocked (e.g. adblocker) — UI already updated */ }
    });
}

/**
 * Initialize blog page
 * Loads metadata and blog post content
 */
function initializeBlogPage() {
    loadLayoutConfiguration();
    loadBlogSiteMetadata();
    loadBlogPost();
    const headerTitle = document.getElementById('blog-header-title');
    if (headerTitle) {
        headerTitle.addEventListener('click', () => {
            headerTitle.blur();
            headerTitle.classList.add('just-clicked');
            setTimeout(() => headerTitle.classList.remove('just-clicked'), 300);
        });
    }
}


/**
 * ===================================================================
 *                    PAGE DETECTION AND INITIALIZATION
 * ===================================================================
 */

// Dynamically update --header-offset based on actual header height
function updateHeaderOffset() {
    const header = document.querySelector('header');
    if (header) {
        const height = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-offset', height + 16 + 'px');
    }
}

// Initialize the appropriate page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeThemeToggle();
        applyPalette();

        // Detect which page we're on
        if (document.getElementById('blog-body')) {
            // We're on the blog detail page
            initializeBlogPage();
        } else if (document.getElementById('profile-content')) {
            // We're on the main page
            initializeMainPage();
        }

        // Set header offset after content loads and on resize
        setTimeout(updateHeaderOffset, 100);
        window.addEventListener('resize', updateHeaderOffset);
    });
} else {
    initializeThemeToggle();
    applyPalette();

    // Detect which page we're on
    if (document.getElementById('blog-body')) {
        initializeBlogPage();
    } else if (document.getElementById('profile-content')) {
        initializeMainPage();
    }

    setTimeout(updateHeaderOffset, 100);
    window.addEventListener('resize', updateHeaderOffset);
}

})(); // End of IIFE
