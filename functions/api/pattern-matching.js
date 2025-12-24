/**
 * Pattern Matching Extraction (Server-side)
 * Same logic as client-side but runs on server to avoid CORS
 */

export function extractWithPatternMatching(htmlContent, programName, universityName, url) {
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
    // Clean content (same as client-side)
    const cleanContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
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
        if (i <= 1) {
          const execResult = pattern.exec(cleanContent);
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
          break;
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

