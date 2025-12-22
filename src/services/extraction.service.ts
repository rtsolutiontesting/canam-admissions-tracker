/**
 * URL extraction service - fetches and processes admissions pages
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config';
import { AIService } from './ai.service';
import { ExtractedData, ExtractionStatus } from '../types';

export class ExtractionService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Extract data from a program URL
   */
  async extractFromUrl(
    url: string,
    programName: string,
    universityName: string,
    country: string
  ): Promise<{ data: ExtractedData; status: ExtractionStatus; errorMessage?: string }> {
    if (!url || !url.startsWith('http')) {
      return {
        data: this.getNotFoundData(),
        status: ExtractionStatus.FETCH_ERROR,
        errorMessage: 'Invalid URL',
      };
    }

    try {
      // Fetch the page
      const htmlContent = await this.fetchUrl(url);
      
      if (!htmlContent) {
        return {
          data: this.getNotFoundData(),
          status: ExtractionStatus.FETCH_ERROR,
          errorMessage: 'Failed to fetch page content',
        };
      }

      // Extract using AI
      const extractedData = await this.aiService.extractDataFromContent(
        htmlContent,
        programName,
        universityName,
        url
      );

      // Check if all fields are NOT_FOUND
      const allNotFound = Object.values(extractedData).every(
        (value) => value === 'NOT_FOUND'
      );

      if (allNotFound) {
        // Try searching official university sources
        const officialData = await this.searchOfficialSources(
          universityName,
          programName,
          country
        );

        if (officialData) {
          return {
            data: officialData,
            status: ExtractionStatus.SUCCESS,
          };
        }

        return {
          data: extractedData,
          status: ExtractionStatus.NOT_FOUND,
          errorMessage: 'Data not found in provided URL or official sources',
        };
      }

      return {
        data: extractedData,
        status: ExtractionStatus.SUCCESS,
      };
    } catch (error: any) {
      const errorMessage = error.message?.substring(0, 200) || 'Unknown error';
      console.error(`Extraction error for ${url}:`, errorMessage);

      return {
        data: this.getNotFoundData(),
        status: ExtractionStatus.FETCH_ERROR,
        errorMessage,
      };
    }
  }

  /**
   * Fetch URL content with retries
   */
  private async fetchUrl(url: string, retries = config.extraction.maxRetries): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: config.extraction.requestTimeoutMs,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          maxRedirects: 5,
        });

        if (response.status === 200 && response.data) {
          return response.data;
        }
      } catch (error: any) {
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, config.extraction.retryDelayMs * attempt)
        );
      }
    }

    return null;
  }

  /**
   * Search official university sources (placeholder - can be enhanced)
   */
  private async searchOfficialSources(
    universityName: string,
    programName: string,
    country: string
  ): Promise<ExtractedData | null> {
    // This is a placeholder for official source search
    // In production, you might:
    // 1. Search university's main admissions page
    // 2. Search country-specific admissions portals
    // 3. Use structured data APIs if available
    
    // For now, return null to indicate not found
    // This can be enhanced with actual search logic
    return null;
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

