import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebSearchResult {
  choice: string;
  isDangerous: boolean;
  safetyScore: number;
  reasoning: string;
  sources: string[];
}

export class WebScraper {
  private static readonly SAFETY_KEYWORDS = [
    'dangerous', 'toxic', 'poison', 'lethal', 'fatal', 'deadly', 'harmful',
    'unsafe', 'risky', 'hazardous', 'explosive', 'flammable', 'corrosive',
    'carcinogenic', 'mutagenic', 'teratogenic', 'neurotoxic', 'hepatotoxic',
    'cardiotoxic', 'nephrotoxic', 'pulmonary', 'respiratory', 'asphyxiant',
    'irritant', 'sensitizer', 'carcinogen', 'mutagen', 'teratogen'
  ];

  private static readonly SAFETY_SOURCES = [
    'wikipedia.org',
    'pubchem.ncbi.nlm.nih.gov',
    'chem.nlm.nih.gov',
    'cdc.gov',
    'who.int',
    'epa.gov',
    'fda.gov',
    'osha.gov',
    'safety.com',
    'poison.org'
  ];

  static async searchChoiceSafety(choice: string): Promise<WebSearchResult> {
    try {
      console.log(`🔍 Web searching for safety info: "${choice}"`);
      
      // Use DuckDuckGo Instant Answer API (no CORS issues)
      const searchQuery = `${choice} safety`;
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      const data = response.data;
      const searchResults: string[] = [];
      
      // Extract information from DuckDuckGo response
      if (data.Abstract) {
        searchResults.push(data.Abstract.toLowerCase());
      }
      if (data.Answer) {
        searchResults.push(data.Answer.toLowerCase());
      }
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
          if (topic.Text) {
            searchResults.push(topic.Text.toLowerCase());
          }
        });
      }
      
      // If no results from DuckDuckGo, add a fallback search
      if (searchResults.length === 0) {
        searchResults.push(`searching for ${choice} safety information`);
      }

      // Analyze the results for safety information
      const safetyAnalysis = this.analyzeSafetyInfo(choice, searchResults);
      
      console.log(`✅ Web search completed for "${choice}": ${safetyAnalysis.isDangerous ? 'DANGEROUS' : 'SAFE'} (${Math.round(safetyAnalysis.safetyScore * 100)}%)`);
      
      return safetyAnalysis;

    } catch (error) {
      console.error(`❌ Web search failed for "${choice}":`, error);
      
      // Fallback to keyword-based analysis
      return this.fallbackSafetyAnalysis(choice);
    }
  }

  private static analyzeSafetyInfo(choice: string, searchResults: string[]): WebSearchResult {
    const lowerChoice = choice.toLowerCase();
    let dangerousCount = 0;
    let totalResults = 0;
    const sources: string[] = [];
    const reasoning: string[] = [];

    // First, check if the choice itself contains dangerous keywords
    const choiceDangerousKeywords = [
      'cyanide', 'arsenic', 'strychnine', 'ricin', 'botulinum', 'sarin',
      'vx', 'tabun', 'soman', 'cyclosarin', 'lewisite', 'mustard gas',
      'phosgene', 'chlorine', 'ammonia', 'hydrogen cyanide', 'carbon monoxide',
      'poison', 'toxic', 'lethal', 'fatal', 'deadly', 'whip', 'abuse',
      'torture', 'harm', 'hurt', 'kill', 'murder', 'suicide'
    ];

    // Check for negation patterns first
    const negationWords = ['not', 'no', 'never', 'avoid', 'prevent', 'stop'];
    const hasNegation = negationWords.some(word => lowerChoice.includes(word));
    
    if (hasNegation) {
      // If there's negation, be more careful about dangerous keywords
      for (const keyword of choiceDangerousKeywords) {
        if (lowerChoice.includes(keyword)) {
          // Check if the negation is applied to the dangerous word
          const negationApplied = negationWords.some(neg => 
            lowerChoice.includes(neg) && lowerChoice.indexOf(neg) < lowerChoice.indexOf(keyword)
          );
          
          if (negationApplied) {
            // This is actually good (not + dangerous = good)
            dangerousCount -= 1; // Reduce danger score
            reasoning.push(`Negation of dangerous keyword: ${keyword}`);
          } else {
            dangerousCount += 2; // Higher weight for direct matches
            reasoning.push(`Choice contains dangerous keyword: ${keyword}`);
          }
        }
      }
    } else {
      // No negation, check normally
      for (const keyword of choiceDangerousKeywords) {
        if (lowerChoice.includes(keyword)) {
          dangerousCount += 2; // Higher weight for direct matches
          reasoning.push(`Choice contains dangerous keyword: ${keyword}`);
        }
      }
    }

    // Check each search result for safety keywords
    for (const result of searchResults) {
      totalResults++;
      
      // Check for safety keywords
      for (const keyword of this.SAFETY_KEYWORDS) {
        if (result.includes(keyword)) {
          dangerousCount++;
          reasoning.push(`Found safety keyword: ${keyword}`);
          break;
        }
      }

      // Check for specific dangerous substances
      const dangerousSubstances = [
        'cyanide', 'arsenic', 'strychnine', 'ricin', 'botulinum', 'sarin',
        'vx', 'tabun', 'soman', 'cyclosarin', 'lewisite', 'mustard gas',
        'phosgene', 'chlorine', 'ammonia', 'hydrogen cyanide', 'carbon monoxide'
      ];

      for (const substance of dangerousSubstances) {
        if (result.includes(substance)) {
          dangerousCount++;
          reasoning.push(`Found dangerous substance: ${substance}`);
          break;
        }
      }

      // Check for safety-related phrases
      const safetyPhrases = [
        'highly toxic', 'extremely dangerous', 'lethal dose', 'fatal if',
        'can cause death', 'may be fatal', 'poisonous', 'deadly',
        'life-threatening', 'severe injury', 'serious harm', 'animal cruelty',
        'animal abuse', 'illegal', 'criminal', 'harmful', 'dangerous'
      ];

      for (const phrase of safetyPhrases) {
        if (result.includes(phrase)) {
          dangerousCount++;
          reasoning.push(`Found safety phrase: ${phrase}`);
          break;
        }
      }
    }

    // Calculate safety score with higher threshold
    const safetyScore = totalResults > 0 ? dangerousCount / totalResults : 0;
    const isDangerous = safetyScore > 0.2 || dangerousCount > 1; // Lowered threshold
    
    // Calculate confidence based on analysis strength
    let confidence = 0.5; // Base confidence
    if (dangerousCount > 0) {
      confidence = Math.min(0.95, 0.5 + (dangerousCount * 0.2));
    } else if (totalResults > 0) {
      confidence = 0.6; // Some web search results found, but no dangers
    }

    return {
      choice,
      isDangerous,
      safetyScore: confidence, // Use calculated confidence instead of safetyScore
      reasoning: reasoning.length > 0 ? reasoning.join('; ') : 'No safety concerns found',
      sources: ['DuckDuckGo Search Results']
    };
  }

  private static fallbackSafetyAnalysis(choice: string): WebSearchResult {
    const lowerChoice = choice.toLowerCase();
    
    // Check for known dangerous substances and actions
    const dangerousKeywords = [
      'cyanide', 'arsenic', 'strychnine', 'ricin', 'botulinum', 'sarin',
      'vx', 'tabun', 'soman', 'cyclosarin', 'lewisite', 'mustard gas',
      'phosgene', 'chlorine', 'ammonia', 'hydrogen cyanide', 'carbon monoxide',
      'poison', 'toxic', 'lethal', 'fatal', 'deadly', 'whip', 'abuse',
      'torture', 'harm', 'hurt', 'kill', 'murder', 'suicide', 'die',
      'crash', 'accident', 'collision', 'wreck', 'explosion', 'bomb',
      'fire', 'burn', 'arson', 'illegal', 'criminal', 'steal', 'rob'
    ];

    const isDangerous = dangerousKeywords.some(keyword => lowerChoice.includes(keyword));
    
    return {
      choice,
      isDangerous,
      safetyScore: isDangerous ? 0.9 : 0.1,
      reasoning: isDangerous ? 'Contains known dangerous keyword' : 'No known safety concerns',
      sources: ['Fallback Analysis']
    };
  }
} 