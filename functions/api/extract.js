/**
 * Cloudflare Worker: AI-Powered Data Extraction API
 * 
 * This is the PROPER solution - server-side fetching + AI extraction
 * No CORS issues, legal, and reliable.
 * 
 * Endpoint: /api/extract
 * Method: POST
 * Body: { url, programName, universityName, aiProvider, apiKey }
 */

export async function onRequestPost(context) {
  const { request } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  try {
    const body = await request.json();
    const { url, programName, universityName, aiProvider = 'gemini', apiKey, geminiApiKey } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Allow pattern matching mode if no AI key provided
    // Don't require API key if using pattern matching
    if (!apiKey && aiProvider !== 'pattern' && !geminiApiKey) {
      // If no AI key and not explicitly requesting pattern matching, use pattern matching as fallback
      aiProvider = 'pattern';
    }

    // Step 1: Fetch HTML server-side (NO CORS issues!)
    let htmlContent = '';
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        redirect: 'follow',
        cf: {
          cacheTtl: 300,
          cacheEverything: false
        }
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }

      htmlContent = await fetchResponse.text();
      
      if (!htmlContent || htmlContent.length < 100) {
        throw new Error('Insufficient content fetched');
      }
    } catch (fetchError) {
      return new Response(JSON.stringify({
        error: `Failed to fetch URL: ${fetchError.message}`,
        admissionDeadline: 'NOT_FOUND',
        casDeadline: 'NOT_FOUND',
        i20Deadline: 'NOT_FOUND',
        intakesAvailable: 'NOT_FOUND',
        intakeStatus: 'NOT_FOUND',
        campusLocation: 'NOT_FOUND',
        remarks: `Fetch error: ${fetchError.message}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Step 2: Extract ALL visible text like a human would read it
    // First, create a virtual DOM parser to extract visible text properly
    let visibleText = '';
    
    // Method 1: Extract text from common content containers (like a human scanning the page)
    const contentSelectors = [
      'main', 'article', '.content', '.main-content', '.page-content',
      '.course-details', '.program-info', '.admission-info', '.intake-info',
      '[role="main"]', '.details', '.info', '.course-info', '.program-details'
    ];
    
    // Extract text from these containers
    for (const selector of contentSelectors) {
      const regex = new RegExp(`<[^>]*class=["'][^"']*${selector.replace('.', '')}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'gi');
      const matches = htmlContent.match(regex);
      if (matches) {
        matches.forEach(match => {
          const text = match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.length > 20) {
            visibleText += ' ' + text;
          }
        });
      }
    }
    
    // Method 2: Extract all text content (human-like reading)
    // Remove scripts, styles, but keep structure to understand context
    let structuredText = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
    
    // Extract text from headings (h1-h6) - humans read these first
    const headings = structuredText.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
    if (headings) {
      headings.forEach(h => {
        const text = h.replace(/<[^>]+>/g, '').trim();
        if (text.length > 3) visibleText += ' HEADING: ' + text + ' ';
      });
    }
    
    // Extract text from paragraphs - main content
    const paragraphs = structuredText.match(/<p[^>]*>([^<]+)<\/p>/gi);
    if (paragraphs) {
      paragraphs.forEach(p => {
        const text = p.replace(/<[^>]+>/g, '').trim();
        if (text.length > 10) visibleText += ' ' + text + ' ';
      });
    }
    
    // Extract text from list items - often contain key info
    const listItems = structuredText.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listItems) {
      listItems.forEach(li => {
        const text = li.replace(/<[^>]+>/g, '').trim();
        if (text.length > 5) visibleText += ' ' + text + ' ';
      });
    }
    
    // Extract text from divs with data attributes or specific classes
    const dataDivs = structuredText.match(/<div[^>]*(?:data-[^=]*=|class=["'][^"']*(?:detail|info|date|deadline|intake|start|duration|study|mode)[^"']*["'])[^>]*>([\s\S]{10,200})<\/div>/gi);
    if (dataDivs) {
      dataDivs.forEach(div => {
        const text = div.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (text.length > 10) visibleText += ' ' + text + ' ';
      });
    }
    
    // Extract all remaining visible text (strip HTML tags)
    const allText = structuredText.replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Combine all extracted text - PRIORITY SECTIONS FIRST
    // Put priority sections at the beginning so they're processed first
    visibleText = (prioritySections + ' ' + visibleText + ' ' + allText)
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to 100KB for AI (increased to capture maximum content for comprehensive extraction)
    // But prioritize: if priority sections exist, ensure they're included
    const cleanHtml = visibleText.substring(0, 100000);

    // Step 3: Extract data using AI with automatic fallback
    let extractedData;
    // geminiApiKey is already extracted from body on line 29
    
    try {
      if (aiProvider === 'pattern' || (!apiKey && !geminiApiKey)) {
        // Use pattern matching if explicitly requested or no AI keys available
        extractedData = extractWithPatternMatchingServer(cleanHtml, programName, universityName, url);
      } else if (aiProvider === 'gemini') {
        extractedData = await extractWithGemini(cleanHtml, programName, universityName, url, apiKey);
      } else if (aiProvider === 'openai') {
        extractedData = await extractWithOpenAI(cleanHtml, programName, universityName, url, apiKey);
      } else {
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
      }
    } catch (primaryError) {
      // If OpenAI hits rate limit (429) and Gemini key is available, automatically fallback
      const isRateLimit = primaryError.isRateLimit || primaryError.statusCode === 429 || primaryError.message.includes('429') || primaryError.message.includes('Rate limit');
      if (aiProvider === 'openai' && isRateLimit && geminiApiKey) {
        try {
          return new Response(JSON.stringify({
            ...(await extractWithGemini(cleanHtml, programName, universityName, url, geminiApiKey)),
            fallbackUsed: true,
            fallbackReason: 'OpenAI rate limit exceeded, used Gemini as fallback'
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (fallbackError) {
          // If Gemini also fails, throw original error
          throw primaryError;
        }
      }
      // Re-throw if no fallback available or fallback failed
      throw primaryError;
    }

    // Step 4: Return extracted data
    return new Response(JSON.stringify(extractedData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      admissionDeadline: 'NOT_FOUND',
      casDeadline: 'NOT_FOUND',
      intakesAvailable: 'NOT_FOUND',
      intakeStatus: 'NOT_FOUND',
      remarks: `Error: ${error.message}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Extract using Google Gemini
async function extractWithGemini(htmlContent, programName, universityName, url, apiKey) {
  const prompt = `Extract university admissions information from the following HTML content. Return ONLY valid JSON (no markdown, no explanations):

{
  "admissionDeadline": "YYYY-MM-DD or NOT_FOUND",
  "casDeadline": "YYYY-MM-DD or NOT_FOUND",
  "i20Deadline": "YYYY-MM-DD or NOT_FOUND",
  "intakesAvailable": "e.g., September 2024, Fall 2024, January 2025 or NOT_FOUND",
  "intakeStatus": "open/closed/waitlist/NOT_FOUND",
  "campusLocation": "campus name or location or NOT_FOUND",
  "remarks": "any important notes or NOT_FOUND"
}

IMPORTANT CONTEXT:
- Focus ONLY on information for INTERNATIONAL STUDENTS FROM INDIA
- Look for location dropdowns, country selectors, or sections mentioning "India", "international students", "overseas students", "international applicants"
- If the page has location/country dropdowns, prioritize information shown when "India" is selected
- Extract deadlines and requirements specifically for international students requiring visas

University: ${universityName || 'Unknown'}
Program: ${programName || 'Unknown'}
URL: ${url}

HTML Content (comprehensive extraction - check ALL sections):
${htmlContent.substring(0, 50000)}

EXTRACTION STRATEGY (MANDATORY - PRIORITIZE DEADLINE SECTIONS):
1. PRIORITY READING: Focus on sections containing "deadline", "application", "international", "visa", "requiring", "students", "India" FIRST
2. Check PRIORITY sections before reading the entire page - these are most likely to contain deadlines
3. Look for highlighted/bolded text FIRST (often contains important deadlines)
4. Check ALL date formats: "3 July 2026", "July 3, 2026", "03/07/2026", "2026-07-03", "3rd July 2026", "July 3rd, 2026"
5. For deadlines: Check if date appears BEFORE or AFTER the deadline text (both formats exist)
   - "3 July 2026 Application deadline for international students requiring a visa" (date FIRST - HIGHEST PRIORITY)
   - "Application deadline for international students requiring a visa: 3 July 2026" (date after)
6. Look in priority locations FIRST: sections with deadline keywords, highlighted text, paragraphs with "international students"
7. Then check other locations: visible text, hidden tabs, dropdowns, accordions, collapsed sections
8. For intakes: Look for "September 2024", "Fall 2024", "2024/25", "Jan 2025", "2024-09", etc.
9. For campus: Check addresses, location mentions, "at [location]", "in [city]", campus names
10. For status: ONLY use if EXPLICITLY stated - do NOT assume based on dates or other info
11. Check multiple passes - if first pattern doesn't match, try alternative patterns
12. NO ASSUMPTIONS - if not found after thorough search, return NOT_FOUND

Rules:
1. Return ONLY the JSON object (no markdown, no code blocks)
2. Dates must be in YYYY-MM-DD format
3. CRITICAL: If information is NOT explicitly found on the page, use "NOT_FOUND" - DO NOT assume, guess, or infer any values
4. Extract campus location from page ONLY if explicitly mentioned (look for "campus", "location", address, city names)
5. Extract intakes from text ONLY if explicitly stated (e.g., "September 2024", "Fall 2024", "2024/25", "Jan 2025")
6. Look for deadlines ONLY if explicitly mentioned near keywords like "deadline", "closing date", "application closes", "apply by", "application deadline for international students", "application deadline for international students requiring a visa"
7. IMPORTANT: The date can appear BEFORE or AFTER the deadline text. Look for both formats:
   - "3 July 2026 Application deadline for international students requiring a visa" (date first - HIGH PRIORITY)
   - "Application deadline for international students requiring a visa: 3 July 2026" (date after)
8. PRIORITIZE deadlines that mention "international students requiring a visa" - these are the most relevant for Indian students
7. INTAKE STATUS LOGIC (CRITICAL - DO NOT ASSUME):
   - ONLY return "open", "closed", or "waitlist" if EXPLICITLY STATED on the page
   - If text explicitly says "closed", "not accepting", "full", "no longer accepting", use "closed"
   - If text explicitly says "waitlist", "waiting list", use "waitlist"
   - If text explicitly says "open", "accepting applications", "now accepting", use "open"
   - If intake status is NOT explicitly mentioned anywhere on the page, return "NOT_FOUND"
   - DO NOT assume status based on deadline dates, future dates, or any other information
   - DO NOT guess, infer, or make assumptions - only use what is clearly and explicitly stated
   - If you are unsure, return "NOT_FOUND"
8. Look for CAS (Confirmation of Acceptance for Studies) deadlines specifically (UK programs) - for international students
9. Look for I-20 deadlines specifically (USA programs) - for international students
10. Check tabs, dropdowns, location selectors, and hidden content for information
11. Parse dates in various formats and convert to YYYY-MM-DD
12. Extract multiple intakes if available (comma-separated)
13. If page has multiple programs or campuses, populate multiplePrograms or multipleCampuses arrays
14. Be thorough - check all sections of the page, especially those mentioning "international", "India", "overseas", "visa"
15. Prioritize information from sections specifically about international students or country-specific requirements`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const extracted = JSON.parse(jsonMatch[0]);
    
    // DO NOT ASSUME - Only use what's explicitly found on the page
    // If intake status is not found, return NOT_FOUND - do not assume "open"
    let intakeStatus = extracted.intakeStatus || 'NOT_FOUND';
    
    // Only accept valid status values
    if (intakeStatus !== 'open' && intakeStatus !== 'closed' && intakeStatus !== 'waitlist') {
      intakeStatus = 'NOT_FOUND';
    }
    
    return {
      admissionDeadline: extracted.admissionDeadline || 'NOT_FOUND',
      casDeadline: extracted.casDeadline || 'NOT_FOUND',
      i20Deadline: extracted.i20Deadline || 'NOT_FOUND',
      intakesAvailable: extracted.intakesAvailable || 'NOT_FOUND',
      intakeStatus: intakeStatus,
      campusLocation: extracted.campusLocation || 'NOT_FOUND',
      extractedUniversityName: extracted.extractedUniversityName || 'NOT_FOUND',
      extractedProgramName: extracted.extractedProgramName || 'NOT_FOUND',
      extractedCampusLocation: extracted.extractedCampusLocation || extracted.campusLocation || 'NOT_FOUND',
      remarks: extracted.remarks || 'Extracted via Gemini AI',
      multiplePrograms: extracted.multiplePrograms || [],
      multipleCampuses: extracted.multipleCampuses || [],
      errorMessage: ''
    };
  } catch (error) {
    throw new Error(`Gemini extraction failed: ${error.message}`);
  }
}

// Extract using OpenAI GPT
async function extractWithOpenAI(htmlContent, programName, universityName, url, apiKey) {
  const prompt = `Extract university admissions information from the following HTML content. Return ONLY valid JSON (no markdown, no explanations):

{
  "admissionDeadline": "YYYY-MM-DD or NOT_FOUND",
  "casDeadline": "YYYY-MM-DD or NOT_FOUND",
  "i20Deadline": "YYYY-MM-DD or NOT_FOUND",
  "intakesAvailable": "e.g., September 2024, Fall 2024, January 2025 or NOT_FOUND",
  "intakeStatus": "open/closed/waitlist/NOT_FOUND",
  "campusLocation": "campus name or location or NOT_FOUND",
  "extractedUniversityName": "university name as it appears on the page or NOT_FOUND",
  "extractedProgramName": "program name as it appears on the page or NOT_FOUND",
  "extractedCampusLocation": "campus location as it appears on the page or NOT_FOUND",
  "remarks": "any important notes or NOT_FOUND"
}

IMPORTANT CONTEXT:
- Focus ONLY on information for INTERNATIONAL STUDENTS FROM INDIA
- Look for location dropdowns, country selectors, or sections mentioning "India", "international students", "overseas students", "international applicants"
- If the page has location/country dropdowns, prioritize information shown when "India" is selected
- Extract deadlines and requirements specifically for international students requiring visas

University: ${universityName || 'Unknown'}
Program: ${programName || 'Unknown'}
URL: ${url}

HTML Content (comprehensive extraction - check ALL sections):
${htmlContent.substring(0, 50000)}

EXTRACTION STRATEGY (MANDATORY - PRIORITIZE DEADLINE SECTIONS):
1. PRIORITY READING: Focus on sections containing "deadline", "application", "international", "visa", "requiring", "students", "India" FIRST
2. Check PRIORITY sections before reading the entire page - these are most likely to contain deadlines
3. Look for highlighted/bolded text FIRST (often contains important deadlines)
4. Check ALL date formats: "3 July 2026", "July 3, 2026", "03/07/2026", "2026-07-03", "3rd July 2026", "July 3rd, 2026"
5. For deadlines: Check if date appears BEFORE or AFTER the deadline text (both formats exist)
   - "3 July 2026 Application deadline for international students requiring a visa" (date FIRST - HIGHEST PRIORITY)
   - "Application deadline for international students requiring a visa: 3 July 2026" (date after)
6. Look in priority locations FIRST: sections with deadline keywords, highlighted text, paragraphs with "international students"
7. Then check other locations: visible text, hidden tabs, dropdowns, accordions, collapsed sections
8. For intakes: Look for "September 2024", "Fall 2024", "2024/25", "Jan 2025", "2024-09", etc.
9. For campus: Check addresses, location mentions, "at [location]", "in [city]", campus names
10. For status: ONLY use if EXPLICITLY stated - do NOT assume based on dates or other info
11. Check multiple passes - if first pattern doesn't match, try alternative patterns
12. NO ASSUMPTIONS - if not found after thorough search, return NOT_FOUND

Rules:
1. Return ONLY the JSON object (no markdown, no code blocks)
2. Dates must be in YYYY-MM-DD format
3. CRITICAL: If information is NOT explicitly found on the page, use "NOT_FOUND" - DO NOT assume, guess, or infer any values
4. Extract campus location from page ONLY if explicitly mentioned (look for "campus", "location", address, city names)
5. Extract intakes from text ONLY if explicitly stated (e.g., "September 2024", "Fall 2024", "2024/25", "Jan 2025")
6. Look for deadlines ONLY if explicitly mentioned near keywords like "deadline", "closing date", "application closes", "apply by", "application deadline for international students", "application deadline for international students requiring a visa"
7. IMPORTANT: The date can appear BEFORE or AFTER the deadline text. Look for both formats:
   - "3 July 2026 Application deadline for international students requiring a visa" (date first - HIGH PRIORITY)
   - "Application deadline for international students requiring a visa: 3 July 2026" (date after)
8. PRIORITIZE deadlines that mention "international students requiring a visa" - these are the most relevant for Indian students
7. INTAKE STATUS LOGIC (CRITICAL - DO NOT ASSUME):
   - ONLY return "open", "closed", or "waitlist" if EXPLICITLY STATED on the page
   - If text explicitly says "closed", "not accepting", "full", "no longer accepting", use "closed"
   - If text explicitly says "waitlist", "waiting list", use "waitlist"
   - If text explicitly says "open", "accepting applications", "now accepting", use "open"
   - If intake status is NOT explicitly mentioned anywhere on the page, return "NOT_FOUND"
   - DO NOT assume status based on deadline dates, future dates, or any other information
   - DO NOT guess, infer, or make assumptions - only use what is clearly and explicitly stated
   - If you are unsure, return "NOT_FOUND"
8. Look for CAS (Confirmation of Acceptance for Studies) deadlines specifically (UK programs) - for international students
9. Look for I-20 deadlines specifically (USA programs) - for international students
10. Check tabs, dropdowns, location selectors, and hidden content for information
11. Parse dates in various formats and convert to YYYY-MM-DD
12. Extract multiple intakes if available (comma-separated)
13. If page has multiple programs or campuses, populate multiplePrograms or multipleCampuses arrays
14. Be thorough - check all sections of the page, especially those mentioning "international", "India", "overseas", "visa"
15. Prioritize information from sections specifically about international students or country-specific requirements
16. Extract university name, program name, and campus location as they appear on the page (from headings, titles, breadcrumbs, or prominent text)
17. For extractedUniversityName: Look for the university name in page title, headings (h1, h2), or prominent text
18. For extractedProgramName: Look for the program/course name in page title, headings, or course name sections
19. For extractedCampusLocation: Look for campus, location, or city information, especially for international students`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction assistant. Extract information from HTML content and return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check if it's a rate limit error (429)
      if (response.status === 429) {
        const error = new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        error.isRateLimit = true;
        error.statusCode = 429;
        throw error;
      }
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const text = data.choices[0].message.content;
    
    // Extract JSON from response
    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    const extracted = JSON.parse(jsonMatch[0]);
    
    // DO NOT ASSUME - Only use what's explicitly found on the page
    // If intake status is not found, return NOT_FOUND - do not assume "open"
    let intakeStatus = extracted.intakeStatus || 'NOT_FOUND';
    
    // Only accept valid status values
    if (intakeStatus !== 'open' && intakeStatus !== 'closed' && intakeStatus !== 'waitlist') {
      intakeStatus = 'NOT_FOUND';
    }
    
    return {
      admissionDeadline: extracted.admissionDeadline || 'NOT_FOUND',
      casDeadline: extracted.casDeadline || 'NOT_FOUND',
      i20Deadline: extracted.i20Deadline || 'NOT_FOUND',
      intakesAvailable: extracted.intakesAvailable || 'NOT_FOUND',
      intakeStatus: intakeStatus,
      campusLocation: extracted.campusLocation || 'NOT_FOUND',
      extractedUniversityName: extracted.extractedUniversityName || 'NOT_FOUND',
      extractedProgramName: extracted.extractedProgramName || 'NOT_FOUND',
      extractedCampusLocation: extracted.extractedCampusLocation || extracted.campusLocation || 'NOT_FOUND',
      remarks: extracted.remarks || 'Extracted via OpenAI',
      multiplePrograms: extracted.multiplePrograms || [],
      multipleCampuses: extracted.multipleCampuses || [],
      errorMessage: ''
    };
  } catch (error) {
    // Preserve rate limit flag if present
    if (error.isRateLimit || error.statusCode === 429) {
      const rateLimitError = new Error(`OpenAI extraction failed: ${error.message}`);
      rateLimitError.isRateLimit = true;
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }
    throw new Error(`OpenAI extraction failed: ${error.message}`);
  }
}

// Pattern matching function (server-side, inline to avoid import issues)
function extractWithPatternMatchingServer(htmlContent, programName, universityName, url) {
  const result = {
    admissionDeadline: 'NOT_FOUND',
    casDeadline: 'NOT_FOUND',
    i20Deadline: 'NOT_FOUND',
    intakesAvailable: 'NOT_FOUND',
    intakeStatus: 'NOT_FOUND',
    campusLocation: 'NOT_FOUND',
    remarks: '',
    errorMessage: ''
  };
  
  try {
    // STEP 1: PRIORITIZE - Extract deadline-related sections FIRST
    // Look for sections containing deadline keywords (these are most likely to have the deadline)
    const deadlineKeywords = ['deadline', 'application', 'international', 'visa', 'requiring', 'students', 'india', 'apply', 'closing', 'due date'];
    let priorityContent = '';
    let remainingContent = htmlContent;
    
    // Extract sections with deadline-related keywords (HIGH PRIORITY)
    const priorityPatterns = [
      // Sections with class/id containing deadline keywords
      /<div[^>]*(?:class|id)=["'][^"']*(?:deadline|application|international|visa|admission|apply|closing)[^"']*["'][^>]*>([\s\S]{50,2000})<\/div>/gi,
      // Paragraphs with deadline keywords
      /<p[^>]*>([^<]{0,500}(?:deadline|application\s+deadline|international\s+students|requiring\s+visa)[^<]{0,500})<\/p>/gi,
      // List items with deadline keywords
      /<li[^>]*>([^<]{0,500}(?:deadline|application\s+deadline|international\s+students|requiring\s+visa)[^<]{0,500})<\/li>/gi,
      // Headings followed by deadline content
      /<h[1-6][^>]*>(?:deadline|application|international)[^<]*<\/h[1-6]>[\s\S]{0,500}([\s\S]{50,1000})/gi,
      // Strong/bold text with deadlines (often highlighted)
      /<(?:strong|b|em|mark)[^>]*>([^<]{0,300}(?:deadline|application\s+deadline|international\s+students|requiring\s+visa)[^<]{0,300})<\/(?:strong|b|em|mark)>/gi,
      // Sections mentioning "India" or "international students"
      /<div[^>]*(?:class|id)=["'][^"']*(?:india|international|overseas|country)[^"']*["'][^>]*>([\s\S]{50,2000})<\/div>/gi,
    ];
    
    for (const pattern of priorityPatterns) {
      const matches = htmlContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract text from the match
          const text = match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.length > 20) {
            priorityContent += ' PRIORITY: ' + text + ' ';
          }
        });
      }
    }
    
    // STEP 2: Clean and combine - Priority content FIRST, then rest
    const cleanPriority = priorityContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
    // Clean remaining content
    const cleanRemaining = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
    // Combine: Priority content FIRST (so patterns match it first)
    const cleanContent = cleanPriority + ' ' + cleanRemaining;
    
    // Priority patterns for international student deadlines
    const internationalDeadlinePatterns = [
      // Priority 1: "3 July 2026 Application deadline for international students requiring a visa" (date BEFORE text)
      /(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})\s+application\s+deadline\s+for\s+international\s+students\s+requiring\s+(?:a\s+)?visa/gi,
      // Priority 2: "Application deadline for international students requiring a visa: 3 July 2026" (date AFTER text)
      /(?:application\s+deadline\s+for\s+international\s+students\s+requiring\s+(?:a\s+)?visa)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
      // Priority 3: Other international student deadline patterns
      /(?:application\s+deadline\s+for\s+international\s+students|deadline\s+for\s+international|international\s+student\s+deadline|deadline\s+for\s+india|india\s+deadline)[\s:]*(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
    ];
    
    let deadlineFound = false;
    for (let i = 0; i < internationalDeadlinePatterns.length; i++) {
      const pattern = internationalDeadlinePatterns[i];
      const matches = cleanContent.match(pattern);
      if (matches && matches.length > 0) {
        let deadline = '';
        // Patterns 0-3 have capturing groups
        if (i <= 3) {
          const execResult = pattern.exec(cleanContent);
          if (execResult && execResult[1]) {
            deadline = execResult[1].trim();
          }
          pattern.lastIndex = 0; // Reset regex
        } else {
          // For other patterns, extract date from match
          const dateMatch = matches[0].match(/(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i);
          if (dateMatch && dateMatch[1]) {
            deadline = dateMatch[1].trim();
          }
        }
        
        if (deadline && deadline.match(/\d/)) {
          result.admissionDeadline = deadline;
          deadlineFound = true;
          console.log(`[Server Pattern Match ${i}] ✅ Found deadline: "${deadline}"`);
          break;
        }
      }
    }
    
    // If still not found, try searching in priority sections only (more focused)
    if (!deadlineFound && cleanPriority) {
      console.log('[Server Pattern Match] Trying priority sections only...');
      for (let i = 0; i < internationalDeadlinePatterns.length; i++) {
        const pattern = internationalDeadlinePatterns[i];
        const matches = cleanPriority.match(pattern);
        if (matches && matches.length > 0) {
          let deadline = '';
          if (i <= 3) {
            const execResult = pattern.exec(cleanPriority);
            if (execResult && execResult[1]) {
              deadline = execResult[1].trim();
            }
            pattern.lastIndex = 0;
          } else {
            const dateMatch = matches[0].match(/(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i);
            if (dateMatch && dateMatch[1]) {
              deadline = dateMatch[1].trim();
            }
          }
          
          if (deadline && deadline.match(/\d/)) {
            result.admissionDeadline = deadline;
            deadlineFound = true;
            console.log(`[Server Pattern Match ${i} - Priority Only] ✅ Found deadline: "${deadline}"`);
            break;
          }
        }
      }
    }
    
    // Extract intakes
    const intakePatterns = [
      /(?:intake|intakes|admission\s+periods)[\s:]*([^.!?\n]{0,200}(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|fall|spring|summer|winter|autumn)[^.!?\n]{0,100})/gi,
      /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|fall|spring|summer|winter|autumn)[a-z]*\s+\d{4}/gi
    ];
    
    const intakesFound = [];
    for (const pattern of intakePatterns) {
      const matches = cleanContent.match(pattern);
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          const cleaned = match.replace(/(?:intake|intakes|available|offered)[\s:]*/gi, '').trim();
          if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
            intakesFound.push(cleaned);
          }
        });
      }
    }
    
    if (intakesFound.length > 0) {
      result.intakesAvailable = [...new Set(intakesFound)].slice(0, 5).join(', ');
    }
    
    // Extract intake status
    if (/(?:closed|not\s+accepting|no\s+longer\s+accepting|applications\s+closed|full|programme\s+is\s+full)/gi.test(cleanContent)) {
      result.intakeStatus = 'closed';
    } else if (/(?:waitlist|waiting\s+list|wait\s+list)/gi.test(cleanContent)) {
      result.intakeStatus = 'waitlist';
    } else if (/(?:open|accepting|now\s+accepting|currently\s+accepting|early\s+applications\s+encouraged|apply\s+early)/gi.test(cleanContent)) {
      result.intakeStatus = 'open';
    }
    
    return result;
  } catch (error) {
    result.errorMessage = `Pattern matching error: ${error.message}`;
    return result;
  }
}

