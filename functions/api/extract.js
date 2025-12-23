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
    const { url, programName, universityName, aiProvider = 'gemini', apiKey } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI API key is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
    
    // Combine all extracted text
    visibleText = (visibleText + ' ' + allText)
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to 80KB for AI (increased from 50KB to capture more content)
    const cleanHtml = visibleText.substring(0, 80000);

    // Step 3: Extract data using AI
    let extractedData;
    
    if (aiProvider === 'gemini') {
      extractedData = await extractWithGemini(cleanHtml, programName, universityName, url, apiKey);
    } else if (aiProvider === 'openai') {
      extractedData = await extractWithOpenAI(cleanHtml, programName, universityName, url, apiKey);
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
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
  "intakesAvailable": "e.g., September 2024, Fall 2024, January 2025 or NOT_FOUND",
  "intakeStatus": "open/closed/waitlist/NOT_FOUND",
  "remarks": "any important notes or NOT_FOUND"
}

University: ${universityName || 'Unknown'}
Program: ${programName || 'Unknown'}
URL: ${url}

HTML Content:
${htmlContent.substring(0, 30000)}

Rules:
1. Return ONLY the JSON object (no markdown, no code blocks)
2. Dates must be in YYYY-MM-DD format
3. If information not found, use "NOT_FOUND"
4. Extract campus location from page (look for "campus", "location", address, city names)
5. Extract intakes from text (e.g., "September 2024", "Fall 2024", "2024/25", "Jan 2025")
6. Look for deadlines near keywords like "deadline", "closing date", "application closes", "apply by"
7. Check intake status: "open", "closed", "waitlist", or "NOT_FOUND"
8. Look for CAS (Confirmation of Acceptance for Studies) deadlines specifically (UK programs)
9. Look for I-20 deadlines specifically (USA programs)
10. Check tabs, dropdowns, and hidden content for information
11. Parse dates in various formats and convert to YYYY-MM-DD
12. Extract multiple intakes if available (comma-separated)
13. If page has multiple programs or campuses, populate multiplePrograms or multipleCampuses arrays
14. Be thorough - check all sections of the page`;

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
    
    return {
      admissionDeadline: extracted.admissionDeadline || 'NOT_FOUND',
      casDeadline: extracted.casDeadline || 'NOT_FOUND',
      i20Deadline: extracted.i20Deadline || 'NOT_FOUND',
      intakesAvailable: extracted.intakesAvailable || 'NOT_FOUND',
      intakeStatus: extracted.intakeStatus || 'NOT_FOUND',
      campusLocation: extracted.campusLocation || 'NOT_FOUND',
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
  "intakesAvailable": "e.g., September 2024, Fall 2024, January 2025 or NOT_FOUND",
  "intakeStatus": "open/closed/waitlist/NOT_FOUND",
  "remarks": "any important notes or NOT_FOUND"
}

University: ${universityName || 'Unknown'}
Program: ${programName || 'Unknown'}
URL: ${url}

HTML Content:
${htmlContent.substring(0, 30000)}

Rules:
1. Return ONLY the JSON object (no markdown, no code blocks)
2. Dates must be in YYYY-MM-DD format
3. If information not found, use "NOT_FOUND"
4. Extract campus location from page (look for "campus", "location", address, city names)
5. Extract intakes from text (e.g., "September 2024", "Fall 2024", "2024/25", "Jan 2025")
6. Look for deadlines near keywords like "deadline", "closing date", "application closes", "apply by"
7. Check intake status: "open", "closed", "waitlist", or "NOT_FOUND"
8. Look for CAS (Confirmation of Acceptance for Studies) deadlines specifically (UK programs)
9. Look for I-20 deadlines specifically (USA programs)
10. Check tabs, dropdowns, and hidden content for information
11. Parse dates in various formats and convert to YYYY-MM-DD
12. Extract multiple intakes if available (comma-separated)
13. If page has multiple programs or campuses, populate multiplePrograms or multipleCampuses arrays
14. Be thorough - check all sections of the page`;

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
    
    return {
      admissionDeadline: extracted.admissionDeadline || 'NOT_FOUND',
      casDeadline: extracted.casDeadline || 'NOT_FOUND',
      i20Deadline: extracted.i20Deadline || 'NOT_FOUND',
      intakesAvailable: extracted.intakesAvailable || 'NOT_FOUND',
      intakeStatus: extracted.intakeStatus || 'NOT_FOUND',
      campusLocation: extracted.campusLocation || 'NOT_FOUND',
      remarks: extracted.remarks || 'Extracted via OpenAI',
      multiplePrograms: extracted.multiplePrograms || [],
      multipleCampuses: extracted.multipleCampuses || [],
      errorMessage: ''
    };
  } catch (error) {
    throw new Error(`OpenAI extraction failed: ${error.message}`);
  }
}

