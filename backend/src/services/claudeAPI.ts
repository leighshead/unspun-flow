import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment';
import { query } from '../config/database';
import logger from '../utils/logger';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

export const getSuggestion = async (
  sentence: string,
  previousSentence?: string,
  nextSentence?: string
) => {
  try {
    const prompt = `Analyze this sentence for media bias. Identify any of these bias types if present: Loaded Language, Framing, Source Imbalance, Speculation/Unverified, Omission, or mark as Neutral.

${previousSentence ? `Context (previous sentence): "${previousSentence}"\n` : ''}
Current sentence to analyze: "${sentence}"
${nextSentence ? `Context (next sentence): "${nextSentence}"` : ''}

Provide your analysis in this JSON format:
{
  "biasTypes": ["type1", "type2"],
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of detected bias",
  "keyPhrases": ["specific words/phrases showing bias"]
}`;

    const message = await anthropic.messages.create({
      model: config.claudeModel,
      max_tokens: config.claudeMaxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const response = content.type === 'text' ? JSON.parse(content.text) : {};

    // Log API usage
    await query(
      `INSERT INTO claude_api_logs (feature, prompt_tokens, completion_tokens, response)
       VALUES ($1, $2, $3, $4)`,
      ['suggestion', message.usage.input_tokens, message.usage.output_tokens, response]
    );

    return response;
  } catch (err) {
    logger.error('Claude API suggestion error:', err);
    throw err;
  }
};

export const getResolutionHelp = async (
  sentence: string,
  context: string,
  annotatorA: any,
  annotatorB: any
) => {
  try {
    const prompt = `Two annotators disagree on bias classification for this sentence. Help resolve the disagreement.

Sentence: "${sentence}"
Context: "${context}"

Annotator A's assessment:
- Bias type: ${annotatorA.biasType.join(', ')}
- Confidence: ${annotatorA.confidence}
- Reasoning: "${annotatorA.notes}"

Annotator B's assessment:
- Bias type: ${annotatorB.biasType.join(', ')}
- Confidence: ${annotatorB.confidence}
- Reasoning: "${annotatorB.notes}"

Provide:
1. Which annotator's assessment is more accurate and why
2. Whether both perspectives have merit
3. Your final recommended classification
4. Specific guidance for future similar cases

Format as JSON:
{
  "agreementWith": "annotator_a|annotator_b|both_partially|neither",
  "recommendedClassification": ["bias_type or neutral"],
  "reasoning": "detailed explanation",
  "teachingPoint": "guidance for similar cases"
}`;

    const message = await anthropic.messages.create({
      model: config.claudeModel,
      max_tokens: config.claudeMaxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const response = content.type === 'text' ? JSON.parse(content.text) : {};

    await query(
      `INSERT INTO claude_api_logs (feature, prompt_tokens, completion_tokens, response)
       VALUES ($1, $2, $3, $4)`,
      ['resolution', message.usage.input_tokens, message.usage.output_tokens, response]
    );

    return response;
  } catch (err) {
    logger.error('Claude API resolution error:', err);
    throw err;
  }
};

export const generateCardText = async (
  articleTitle: string,
  source: string,
  biasFindings: string
) => {
  try {
    const prompt = `Create a social media "Bias Radar" card for this article analysis.

Article: "${articleTitle}"
Source: ${source}

Key bias findings:
${biasFindings}

Generate 3 versions:
1. Twitter/X (280 chars max) - punchy, attention-grabbing
2. Instagram caption (150 chars) - visual, concise
3. LinkedIn (500 chars) - professional, detailed

Each should:
- Highlight 2-3 specific bias types found
- Mention the outlet neutrally (not attacking)
- Include call-to-action: "See how we scored this"
- Maintain educational, not partisan, tone

Format as JSON with fields: twitter, instagram, linkedin`;

    const message = await anthropic.messages.create({
      model: config.claudeModel,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const response = content.type === 'text' ? JSON.parse(content.text) : {};

    await query(
      `INSERT INTO claude_api_logs (feature, prompt_tokens, completion_tokens, response)
       VALUES ($1, $2, $3, $4)`,
      ['card_generation', message.usage.input_tokens, message.usage.output_tokens, response]
    );

    return response;
  } catch (err) {
    logger.error('Claude API card generation error:', err);
    throw err;
  }
};
