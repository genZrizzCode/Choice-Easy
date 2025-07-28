import { WebScraper, WebSearchResult } from './webScraper';

export interface ChoiceEvaluation {
  choice: string;
  isGood: boolean;
  reasoning: string;
  confidence: number;
  webSearchResult?: WebSearchResult;
}

export class CustomAI {
  // Sentiment analysis word lists
  private static positiveWords = new Set([
    'good', 'great', 'excellent', 'best', 'love', 'like', 'enjoy', 'fun', 'exciting',
    'amazing', 'wonderful', 'perfect', 'awesome', 'fantastic', 'brilliant', 'outstanding',
    'superb', 'marvelous', 'delightful', 'pleasurable', 'satisfying', 'rewarding',
    'fulfilling', 'enjoyable', 'entertaining', 'interesting', 'engaging', 'stimulating',
    'inspiring', 'motivating', 'energizing', 'refreshing', 'relaxing', 'peaceful',
    'calm', 'happy', 'joy', 'pleasure', 'comfort', 'cozy', 'warm', 'friendly',
    'welcoming', 'inviting', 'appealing', 'attractive', 'beautiful', 'gorgeous',
    'stunning', 'magnificent', 'splendid', 'glorious', 'divine', 'heavenly',
    'blissful', 'ecstatic', 'thrilled', 'elated', 'jubilant', 'cheerful',
    'optimistic', 'hopeful', 'confident', 'proud', 'accomplished', 'successful',
    'productive', 'creative', 'innovative', 'helpful', 'supportive', 'caring',
    'kind', 'generous', 'thoughtful', 'considerate', 'respectful', 'honest',
    'trustworthy', 'reliable', 'dependable', 'responsible', 'mature', 'wise',
    'intelligent', 'smart', 'clever', 'bright', 'talented', 'gifted', 'skilled',
    'capable', 'competent', 'efficient', 'effective', 'powerful', 'strong',
    'healthy', 'fit', 'active', 'energetic', 'vibrant', 'lively', 'dynamic',
    'passionate', 'enthusiastic', 'eager', 'excited', 'curious', 'adventurous',
    'courageous', 'brave', 'bold', 'confident', 'independent', 'free', 'liberated',
    'not', 'avoid', 'prevent', 'stop', 'cease', 'halt', 'end', 'finish'
  ]);

  private static negativeWords = new Set([
    'bad', 'terrible', 'awful', 'worst', 'hate', 'dislike', 'never', 'stop',
    'quit', 'give up', 'nothing', 'boring', 'dull', 'lame', 'stupid', 'dumb',
    'idiot', 'waste', 'pointless', 'useless', 'meaningless', 'nonsense',
    'ridiculous', 'absurd', 'crazy', 'insane', 'dangerous', 'risky', 'scary',
    'fear', 'afraid', 'worried', 'anxious', 'stress', 'tired', 'exhausted',
    'broke', 'poor', 'cheap', 'expensive', 'costly', 'money', 'cost',
    'overpriced', 'waste money', 'lose money', 'spend money', 'die', 'death',
    'kill', 'suicide', 'harm', 'hurt', 'pain', 'suffer', 'cry', 'sad',
    'depressed', 'angry', 'mad', 'furious', 'upset', 'disappointed', 'frustrated',
    'annoyed', 'irritated', 'bothered', 'troubled', 'distressed', 'miserable',
    'unhappy', 'sorrowful', 'grief', 'mourning', 'despair', 'hopeless',
    'helpless', 'powerless', 'weak', 'fragile', 'vulnerable', 'exposed',
    'threatened', 'endangered', 'unsafe', 'unstable', 'unreliable', 'untrustworthy',
    'dishonest', 'deceitful', 'lying', 'cheating', 'stealing', 'hurting',
    'damaging', 'destroying', 'ruining', 'breaking', 'crushing', 'smashing',
    'burning', 'killing', 'murdering', 'slaughtering', 'torturing', 'abusing',
    'neglecting', 'ignoring', 'abandoning', 'rejecting', 'excluding', 'isolating',
    'lonely', 'alone', 'separated', 'divided', 'split', 'broken', 'damaged',
    'injured', 'wounded', 'bleeding', 'sick', 'ill', 'diseased', 'infected',
    'contaminated', 'poisoned', 'toxic', 'deadly', 'fatal', 'lethal', 'mortal',
    'cyanide', 'poison', 'arsenic', 'strychnine', 'ricin', 'botulinum',
    'crash', 'accident', 'collision', 'wreck', 'total', 'destroyed',
    'explosion', 'bomb', 'explosive', 'detonate', 'blast', 'fire',
    'burn', 'arson', 'incendiary', 'flammable', 'combustible', 'molest', 'molester', 'molesting'
  ]);

  // Action analysis
  private static positiveActions = new Set([
    'go', 'visit', 'explore', 'discover', 'learn', 'study', 'read', 'write',
    'create', 'build', 'make', 'design', 'develop', 'improve', 'enhance',
    'help', 'support', 'assist', 'guide', 'teach', 'mentor', 'coach',
    'exercise', 'workout', 'train', 'practice', 'rehearse', 'prepare',
    'cook', 'bake', 'clean', 'organize', 'plan', 'schedule', 'arrange',
    'meet', 'connect', 'socialize', 'network', 'communicate', 'talk',
    'listen', 'share', 'give', 'donate', 'volunteer', 'contribute',
    'celebrate', 'enjoy', 'relax', 'rest', 'sleep', 'meditate', 'pray',
    'reflect', 'think', 'consider', 'evaluate', 'analyze', 'research',
    'investigate', 'examine', 'review', 'assess', 'judge', 'decide',
    'choose', 'select', 'pick', 'opt', 'prefer', 'favor', 'like',
    'love', 'adore', 'cherish', 'treasure', 'value', 'appreciate',
    'respect', 'honor', 'admire', 'praise', 'compliment', 'encourage',
    'motivate', 'inspire', 'empower', 'enable', 'allow', 'permit',
    'accept', 'embrace', 'welcome', 'include', 'invite', 'ask',
    'request', 'suggest', 'propose', 'recommend', 'advise', 'counsel'
  ]);

  private static negativeActions = new Set([
    'avoid', 'skip', 'ignore', 'neglect', 'abandon', 'desert', 'leave',
    'quit', 'stop', 'end', 'finish', 'terminate', 'cancel', 'abort',
    'destroy', 'ruin', 'break', 'damage', 'harm', 'hurt', 'injure',
    'kill', 'murder', 'slaughter', 'torture', 'abuse', 'mistreat',
    'hate', 'despise', 'loathe', 'detest', 'abhor', 'disgust',
    'reject', 'deny', 'refuse', 'decline', 'dismiss', 'disregard',
    'forget', 'ignore', 'overlook', 'miss', 'lose', 'waste', 'squander',
    'steal', 'rob', 'cheat', 'lie', 'deceive', 'trick', 'fool',
    'betray', 'abandon', 'desert', 'leave', 'quit', 'give up',
    'surrender', 'yield', 'submit', 'concede', 'admit defeat',
    'complain', 'whine', 'moan', 'grumble', 'protest', 'object',
    'argue', 'fight', 'conflict', 'dispute', 'disagree', 'oppose',
    'resist', 'defy', 'rebel', 'revolt', 'reject', 'deny'
  ]);

  // Context analysis
  private static positiveContexts = new Set([
    'family', 'friends', 'loved ones', 'community', 'team', 'group',
    'education', 'learning', 'knowledge', 'wisdom', 'growth', 'development',
    'health', 'fitness', 'wellness', 'nutrition', 'exercise', 'sports',
    'art', 'music', 'literature', 'culture', 'heritage', 'tradition',
    'nature', 'environment', 'conservation', 'sustainability', 'ecology',
    'science', 'technology', 'innovation', 'progress', 'advancement',
    'business', 'career', 'profession', 'work', 'employment', 'job',
    'travel', 'adventure', 'exploration', 'discovery', 'journey',
    'home', 'house', 'garden', 'kitchen', 'bedroom', 'living room',
    'school', 'university', 'college', 'library', 'museum', 'theater',
    'park', 'beach', 'mountain', 'forest', 'river', 'lake', 'ocean'
  ]);

  private static negativeContexts = new Set([
    'violence', 'crime', 'illegal', 'criminal', 'prison', 'jail',
    'drugs', 'alcohol', 'addiction', 'substance', 'abuse', 'overdose',
    'disease', 'illness', 'sickness', 'infection', 'virus', 'bacteria',
    'poverty', 'homelessness', 'hunger', 'starvation', 'malnutrition',
    'war', 'conflict', 'battle', 'fight', 'struggle', 'suffering',
    'death', 'dying', 'mortality', 'funeral', 'burial', 'cemetery',
    'isolation', 'loneliness', 'solitude', 'separation', 'divorce',
    'loss', 'grief', 'mourning', 'sadness', 'depression', 'despair'
  ]);

  static async evaluateChoices(choices: string[]): Promise<ChoiceEvaluation[]> {
    console.log('🧠 Custom AI evaluating choices:', choices);
    
    const evaluations: ChoiceEvaluation[] = [];
    
    for (const choice of choices) {
      // First do local analysis
      const localEvaluation = this.evaluateChoice(choice);
      
      // Then do web search for additional safety info
      let webSearchResult: WebSearchResult | undefined;
      try {
        webSearchResult = await WebScraper.searchChoiceSafety(choice);
        
        // Only override if web search found dangerous info AND local analysis didn't already catch it
        if (webSearchResult.isDangerous && localEvaluation.isGood) {
          localEvaluation.isGood = false;
          localEvaluation.confidence = Math.max(localEvaluation.confidence, webSearchResult.safetyScore);
          localEvaluation.reasoning = `Web search found safety concerns: ${webSearchResult.reasoning}`;
        }
        
        // If web search confirms local analysis, boost confidence
        if (webSearchResult.isDangerous === !localEvaluation.isGood) {
          localEvaluation.confidence = Math.min(0.95, localEvaluation.confidence + 0.1);
        }
      } catch (error) {
        console.log(`⚠️ Web search failed for "${choice}", using local analysis only`);
      }
      
      const finalEvaluation: ChoiceEvaluation = {
        ...localEvaluation,
        webSearchResult
      };
      
      console.log(`📊 "${choice}" -> ${finalEvaluation.isGood ? 'GOOD' : 'BAD'} (${Math.round(finalEvaluation.confidence * 100)}%)`);
      evaluations.push(finalEvaluation);
    }
    
    return evaluations;
  }

  private static evaluateChoice(choice: string): ChoiceEvaluation {
    const lowerChoice = choice.toLowerCase();
    const words = lowerChoice.split(/\s+/);
    
    // Check for negation patterns first
    const negationAnalysis = this.analyzeNegation(choice, words);
    if (negationAnalysis.hasNegation && negationAnalysis.evaluation) {
      return negationAnalysis.evaluation;
    }
    
    // Calculate sentiment scores
    const positiveScore = this.calculatePositiveScore(lowerChoice, words);
    const negativeScore = this.calculateNegativeScore(lowerChoice, words);
    
    // Calculate action scores
    const positiveActionScore = this.calculatePositiveActionScore(lowerChoice, words);
    const negativeActionScore = this.calculateNegativeActionScore(lowerChoice, words);
    
    // Calculate context scores
    const positiveContextScore = this.calculatePositiveContextScore(lowerChoice);
    const negativeContextScore = this.calculateNegativeContextScore(lowerChoice);
    
    // Calculate length and complexity scores
    const lengthScore = this.calculateLengthScore(choice);
    const complexityScore = this.calculateComplexityScore(choice);
    
    // Combine all scores
    const totalPositive = positiveScore + positiveActionScore + positiveContextScore + lengthScore + complexityScore;
    const totalNegative = negativeScore + negativeActionScore + negativeContextScore;
    
    // Determine if choice is good
    const isGood = totalPositive > totalNegative && totalNegative < 0.3;
    
    // Calculate confidence based on score difference
    const scoreDifference = Math.abs(totalPositive - totalNegative);
    const confidence = Math.min(0.95, Math.max(0.5, 0.5 + scoreDifference));
    
    // Generate reasoning
    const reasoning = this.generateReasoning(choice, {
      positiveScore,
      negativeScore,
      positiveActionScore,
      negativeActionScore,
      positiveContextScore,
      negativeContextScore,
      lengthScore,
      complexityScore,
      isGood
    });
    
    return {
      choice,
      isGood,
      reasoning,
      confidence
    };
  }

  private static analyzeNegation(choice: string, words: string[]): { hasNegation: boolean; evaluation: ChoiceEvaluation | null } {
    const lowerChoice = choice.toLowerCase();
    
    // Check for negation patterns
    const negationWords = ['not', 'no', 'never', 'avoid', 'prevent', 'stop', 'cease', 'halt'];
    const negativeWords = ['die', 'death', 'kill', 'suicide', 'harm', 'hurt', 'pain', 'suffer'];
    const positiveWords = ['live', 'survive', 'help', 'love', 'enjoy', 'good', 'great', 'do', 'work', 'study', 'learn'];
    const neutralWords = ['homework', 'work', 'study', 'learn', 'read', 'write', 'exercise'];
    
    for (const negationWord of negationWords) {
      if (lowerChoice.includes(negationWord)) {
        // Check if the negation is applied to a negative word
        for (const negativeWord of negativeWords) {
          if (lowerChoice.includes(negativeWord)) {
            // This is a positive choice (not + negative = positive)
            return {
              hasNegation: true,
              evaluation: {
                choice,
                isGood: true,
                reasoning: `Negation of negative action: ${negationWord} ${negativeWord}`,
                confidence: 0.9
              }
            };
          }
        }
        
        // Check if negation is applied to a positive word
        for (const positiveWord of positiveWords) {
          if (lowerChoice.includes(positiveWord)) {
            // This is a negative choice (not + positive = negative)
            return {
              hasNegation: true,
              evaluation: {
                choice,
                isGood: false,
                reasoning: `Negation of positive action: ${negationWord} ${positiveWord}`,
                confidence: 0.8
              }
            };
          }
        }
        
        // Check if negation is applied to a neutral word
        for (const neutralWord of neutralWords) {
          if (lowerChoice.includes(neutralWord)) {
            // This is a slightly negative choice (not + neutral = slightly negative)
            return {
              hasNegation: true,
              evaluation: {
                choice,
                isGood: false,
                reasoning: `Negation of neutral action: ${negationWord} ${neutralWord}`,
                confidence: 0.7
              }
            };
          }
        }
      }
    }
    
    return { hasNegation: false, evaluation: null };
  }

  private static calculatePositiveScore(text: string, words: string[]): number {
    let score = 0;
    for (const word of words) {
      if (this.positiveWords.has(word)) {
        score += 0.3;
      }
    }
    return Math.min(1, score);
  }

  private static calculateNegativeScore(text: string, words: string[]): number {
    let score = 0;
    for (const word of words) {
      if (this.negativeWords.has(word)) {
        score += 0.4; // Negative words have higher weight
      }
    }
    return Math.min(1, score);
  }

  private static calculatePositiveActionScore(text: string, words: string[]): number {
    let score = 0;
    for (const word of words) {
      if (this.positiveActions.has(word)) {
        score += 0.2;
      }
    }
    return Math.min(1, score);
  }

  private static calculateNegativeActionScore(text: string, words: string[]): number {
    let score = 0;
    for (const word of words) {
      if (this.negativeActions.has(word)) {
        score += 0.3;
      }
    }
    return Math.min(1, score);
  }

  private static calculatePositiveContextScore(text: string): number {
    let score = 0;
    for (const context of this.positiveContexts) {
      if (text.includes(context)) {
        score += 0.15;
      }
    }
    return Math.min(1, score);
  }

  private static calculateNegativeContextScore(text: string): number {
    let score = 0;
    for (const context of this.negativeContexts) {
      if (text.includes(context)) {
        score += 0.25;
      }
    }
    return Math.min(1, score);
  }

  private static calculateLengthScore(choice: string): number {
    if (choice.length < 3) return -0.5; // Too short
    if (choice.length < 10) return 0.1; // Short but acceptable
    if (choice.length < 50) return 0.2; // Good length
    return 0.1; // Very long, might be too verbose
  }

  private static calculateComplexityScore(choice: string): number {
    const words = choice.split(/\s+/);
    const uniqueWords = new Set(words);
    const complexity = uniqueWords.size / Math.max(1, words.length);
    
    if (complexity < 0.3) return -0.2; // Too repetitive
    if (complexity > 0.8) return 0.2; // Good variety
    return 0.1; // Moderate complexity
  }

  private static generateReasoning(choice: string, scores: any): string {
    const reasons = [];
    
    if (scores.positiveScore > 0.3) {
      reasons.push('contains positive language');
    }
    if (scores.negativeScore > 0.3) {
      reasons.push('contains negative language');
    }
    if (scores.positiveActionScore > 0.2) {
      reasons.push('suggests constructive actions');
    }
    if (scores.negativeActionScore > 0.2) {
      reasons.push('suggests harmful actions');
    }
    if (scores.positiveContextScore > 0.1) {
      reasons.push('involves positive contexts');
    }
    if (scores.negativeContextScore > 0.1) {
      reasons.push('involves negative contexts');
    }
    if (choice.length < 3) {
      reasons.push('too short to be meaningful');
    }
    
    if (reasons.length === 0) {
      return scores.isGood ? 'neutral choice with positive potential' : 'neutral choice with some concerns';
    }
    
    return reasons.join(', ');
  }
} 