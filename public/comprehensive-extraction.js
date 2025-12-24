/**
 * COMPREHENSIVE DATA EXTRACTION ENGINE
 * 
 * Extracts ALL expected fields using multiple strategies:
 * - Paragraphs, dropdowns, tables, divs, spans, labels
 * - All possible date/time format permutations
 * - Hidden content, tabs, accordions
 * - Multiple passes with different patterns
 * 
 * NO ASSUMPTIONS - Only extract what's explicitly found
 */

// Comprehensive deadline extraction with ALL possible formats
function extractDeadlineComprehensive(htmlContent, deadlineType = 'application') {
    const cleanContent = htmlContent.toLowerCase();
    const foundDeadlines = [];
    
    // ALL POSSIBLE DATE FORMATS
    const dateFormats = [
        // Full month names
        /\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4}/gi,
        // Abbreviated months
        /\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/gi,
        // Numeric formats
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
        /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g,
        // Day Month Year (UK format)
        /\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/gi,
        // Month Day, Year (US format)
        /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}/gi
    ];
    
    // Priority patterns based on deadline type
    let priorityPatterns = [];
    
    if (deadlineType === 'application' || deadlineType === 'admission') {
        priorityPatterns = [
            // Highest priority: Visa-requiring international students (date BEFORE text)
            {
                pattern: /(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})\s+application\s+deadline\s+for\s+international\s+students\s+requiring\s+a\s+visa/gi,
                priority: 1,
                context: 'VISA_REQUIRING_INTERNATIONAL'
            },
            // Date AFTER text
            {
                pattern: /application\s+deadline\s+for\s+international\s+students\s+requiring\s+a\s+visa[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 2,
                context: 'VISA_REQUIRING_INTERNATIONAL'
            },
            // India-specific
            {
                pattern: /(?:deadline\s+for\s+india|india\s+deadline|international\s+students\s+from\s+india)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 3,
                context: 'INDIA_SPECIFIC'
            },
            // Generic international
            {
                pattern: /(?:application\s+deadline\s+for\s+international\s+students|deadline\s+for\s+international|international\s+student\s+deadline)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 4,
                context: 'INTERNATIONAL'
            },
            // Generic application deadline
            {
                pattern: /(?:application\s+deadline|admission\s+deadline|deadline|closing\s+date)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 5,
                context: 'GENERIC'
            }
        ];
    } else if (deadlineType === 'cas') {
        priorityPatterns = [
            {
                pattern: /(?:cas\s+deadline|cas\s+submission\s+deadline|confirmation\s+of\s+acceptance\s+for\s+studies\s+deadline)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 1,
                context: 'CAS_DEADLINE'
            },
            {
                pattern: /cas[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 2,
                context: 'CAS_SHORT'
            }
        ];
    } else if (deadlineType === 'i20') {
        priorityPatterns = [
            {
                pattern: /(?:i-20\s+deadline|i20\s+deadline|form\s+i-20\s+deadline|i-20\s+form\s+deadline)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 1,
                context: 'I20_DEADLINE'
            },
            {
                pattern: /i-20[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
                priority: 2,
                context: 'I20_SHORT'
            }
        ];
    }
    
    // Try each priority pattern
    for (const patternConfig of priorityPatterns) {
        const matches = cleanContent.match(patternConfig.pattern);
        if (matches && matches.length > 0) {
            matches.forEach(match => {
                // Extract date from match
                for (const dateFormat of dateFormats) {
                    const dateMatch = match.match(dateFormat);
                    if (dateMatch && dateMatch[0]) {
                        foundDeadlines.push({
                            date: dateMatch[0],
                            priority: patternConfig.priority,
                            context: patternConfig.context
                        });
                        break;
                    }
                }
            });
            
            // If high priority found, return immediately
            if (patternConfig.priority <= 2 && foundDeadlines.length > 0) {
                return foundDeadlines.sort((a, b) => a.priority - b.priority)[0].date;
            }
        }
    }
    
    // Return best match if found
    if (foundDeadlines.length > 0) {
        return foundDeadlines.sort((a, b) => a.priority - b.priority)[0].date;
    }
    
    return 'NOT_FOUND';
}

// Comprehensive intake extraction
function extractIntakesComprehensive(htmlContent) {
    const cleanContent = htmlContent.toLowerCase();
    const foundIntakes = [];
    
    // Multiple strategies for intake extraction
    const strategies = [
        // Strategy 1: Explicit intake mentions
        {
            patterns: [
                /(?:intake|intakes|admission\s+periods|application\s+cycles)[\s:]*([^.!?\n]{0,200}(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|fall|spring|summer|winter|autumn)[^.!?\n]{0,100})/gi,
                /(?:start\s+date|course\s+start|program\s+start)[\s:]*([^.!?\n]{0,100}(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|fall|spring|summer|winter|autumn)[^.!?\n]{0,50}\s*\d{4})/gi
            ],
            source: 'EXPLICIT_MENTION'
        },
        // Strategy 2: Date patterns
        {
            patterns: [
                /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|fall|spring|summer|winter|autumn)[a-z]*\s+\d{4}/gi
            ],
            source: 'DATE_PATTERN'
        },
        // Strategy 3: Year patterns
        {
            patterns: [
                /\d{4}[\/\-]\d{1,4}/g,
                /(?:2024|2025|2026|2027)[\/\-](?:2024|2025|2026|2027)/g
            ],
            source: 'YEAR_PATTERN'
        }
    ];
    
    for (const strategy of strategies) {
        for (const pattern of strategy.patterns) {
            const matches = cleanContent.match(pattern);
            if (matches && matches.length > 0) {
                matches.forEach(match => {
                    const cleaned = match.replace(/(?:intake|intakes|available|offered|start|date)[\s:]*/gi, '').trim();
                    if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
                        foundIntakes.push({
                            value: cleaned,
                            source: strategy.source
                        });
                    }
                });
            }
        }
    }
    
    // Remove duplicates
    const uniqueIntakes = [...new Set(foundIntakes.map(i => i.value))];
    return uniqueIntakes.length > 0 ? uniqueIntakes.slice(0, 5).join(', ') : 'NOT_FOUND';
}

// Comprehensive campus location extraction
function extractCampusLocationComprehensive(htmlContent) {
    const cleanContent = htmlContent.toLowerCase();
    const foundLocations = [];
    
    const locationPatterns = [
        // Explicit campus mentions
        /(?:campus|location|located\s+in|study\s+at)[\s:]*([^.!?\n]{0,100}(?:campus|university|college|building|street|avenue|road|city|town|uk|usa|united\s+kingdom|united\s+states)[^.!?\n]{0,50})/gi,
        // Address patterns
        /([A-Z][a-z]+\s+(?:Campus|University|College|Building|Street|Avenue|Road|City|Town))/g,
        // "At [Location]" or "In [Location]"
        /(?:at|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Campus|University|College))/gi,
        // Country mentions
        /(?:uk|united\s+kingdom|usa|united\s+states|canada|australia)/gi
    ];
    
    for (const pattern of locationPatterns) {
        const matches = cleanContent.match(pattern);
        if (matches && matches.length > 0) {
            matches.forEach(match => {
                const cleaned = match.replace(/(?:campus|location|located\s+in|address|at|in)[\s:]*/gi, '').trim();
                if (cleaned && cleaned.length > 2 && cleaned.length < 100) {
                    foundLocations.push(cleaned);
                }
            });
        }
    }
    
    // Remove duplicates
    const uniqueLocations = [...new Set(foundLocations)];
    return uniqueLocations.length > 0 ? uniqueLocations[0] : 'NOT_FOUND';
}

// Export for use in main extraction
if (typeof window !== 'undefined') {
    window.extractDeadlineComprehensive = extractDeadlineComprehensive;
    window.extractIntakesComprehensive = extractIntakesComprehensive;
    window.extractCampusLocationComprehensive = extractCampusLocationComprehensive;
}

