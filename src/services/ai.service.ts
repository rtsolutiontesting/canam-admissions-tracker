/**
 * Google AI Studio (Gemini) service for data extraction
 * CRITICAL: Outputs strict JSON only (no markdown, no explanations, no HTML)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { ExtractedData } from '../types';

export class AIService {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!config.ai.apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is required');
    }
    this.client = new GoogleGenerativeAI(config.ai.apiKey);
  }

  /**
   * Extract structured data from HTML content using AI
   * Returns strict JSON only
   */
  async extractDataFromContent(
    htmlContent: string,
    programName: string,
    universityName: string,
    url: string
  ): Promise<ExtractedData> {
    const prompt = this.buildExtractionPrompt(htmlContent, programName, universityName, url);

    try {
      const model = this.client.getGenerativeModel({ model: config.ai.model });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response - handle various formats
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/^```json\s*/i, '');
      jsonText = jsonText.replace(/^```\s*/i, '');
      jsonText = jsonText.replace(/\s*```$/i, '');
      
      // Extract JSON object (find first { and last })
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('No valid JSON object found in AI response');
      }
      
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);

      const extracted = JSON.parse(jsonText) as ExtractedData;

      // Validate and sanitize
      return this.sanitizeExtractedData(extracted);
    } catch (error) {
      console.error('AI extraction error:', error);
      // Return NOT_FOUND on error
      return this.getNotFoundData();
    }
  }

  /**
   * Build the extraction prompt
   * CRITICAL: Emphasizes strict JSON output only
   */
  private buildExtractionPrompt(
    htmlContent: string,
    programName: string,
    universityName: string,
    url: string
  ): string {
    // Clean HTML - remove scripts, styles, and excessive whitespace
    const cleanContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 50000); // Limit content size

    return `You are a data extraction assistant. Extract university admissions information from the following content.

CONTEXT:
- University: ${universityName}
- Program: ${programName}
- Source URL: ${url}

HTML CONTENT (cleaned):
${cleanContent}

TASK:
Extract the following information and return ONLY valid JSON (no markdown, no explanations, no HTML, no code blocks).

REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "intakeOffered": "string (e.g., 'Fall, Spring, Summer' or 'NOT_FOUND')",
  "intakeStatus": "string (one of: 'open', 'closed', 'waitlist', 'NOT_FOUND')",
  "applicationDeadline": "string (ISO date format YYYY-MM-DD or 'NOT_FOUND')",
  "casDeadline": "string (ISO date format YYYY-MM-DD or 'NOT_FOUND' - UK programs only)",
  "i20Deadline": "string (ISO date format YYYY-MM-DD or 'NOT_FOUND' - USA programs only)",
  "admissionAlerts": "string (any important alerts or notes, max 500 chars, or 'NOT_FOUND')"
}

CRITICAL RULES:
1. Return ONLY the JSON object, nothing else
2. Do NOT wrap in markdown code blocks
3. Do NOT include explanations or comments
4. Do NOT include HTML tags
5. If information is not found, use "NOT_FOUND" as the value
6. Dates must be in ISO format (YYYY-MM-DD) if available
7. Keep all text values under 500 characters
8. For intakeStatus, use lowercase: 'open', 'closed', 'waitlist', or 'NOT_FOUND'
9. If the content is unclear or insufficient, return "NOT_FOUND" for all fields

OUTPUT (JSON only, no other text):`;
  }

  /**
   * Sanitize and validate extracted data
   */
  private sanitizeExtractedData(data: ExtractedData): ExtractedData {
    const sanitize = (value: string): string => {
      if (!value || typeof value !== 'string') return 'NOT_FOUND';
      const cleaned = value.trim().substring(0, config.extraction.maxFieldLength);
      return cleaned || 'NOT_FOUND';
    };

    return {
      intakeOffered: sanitize(data.intakeOffered),
      intakeStatus: this.validateIntakeStatus(data.intakeStatus),
      applicationDeadline: sanitize(data.applicationDeadline),
      casDeadline: sanitize(data.casDeadline),
      i20Deadline: sanitize(data.i20Deadline),
      admissionAlerts: sanitize(data.admissionAlerts),
    };
  }

  /**
   * Validate intake status
   */
  private validateIntakeStatus(status: string): 'open' | 'closed' | 'waitlist' | 'NOT_FOUND' {
    const normalized = status?.toLowerCase().trim();
    if (['open', 'closed', 'waitlist'].includes(normalized)) {
      return normalized as 'open' | 'closed' | 'waitlist';
    }
    return 'NOT_FOUND';
  }

  /**
   * Get default NOT_FOUND data structure
   */
  private getNotFoundData(): ExtractedData {
    return {
      intakeOffered: 'NOT_FOUND',
      intakeStatus: 'NOT_FOUND',
      applicationDeadline: 'NOT_FOUND',
      casDeadline: 'NOT_FOUND',
      i20Deadline: 'NOT_FOUND',
      admissionAlerts: 'NOT_FOUND',
    };
  }
}
