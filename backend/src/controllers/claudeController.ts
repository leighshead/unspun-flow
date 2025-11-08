import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getSuggestion, getResolutionHelp, generateCardText } from '../services/claudeAPI';
import logger from '../utils/logger';

export const suggest = async (req: AuthRequest, res: Response) => {
  try {
    const { sentence, previousSentence, nextSentence } = req.body;

    const suggestion = await getSuggestion(sentence, previousSentence, nextSentence);

    res.json(suggestion);
  } catch (err) {
    logger.error('Claude suggest error:', err);
    res.status(500).json({ error: 'Failed to get suggestion from Claude' });
  }
};

export const resolve = async (req: AuthRequest, res: Response) => {
  try {
    const { sentence, context, annotatorA, annotatorB } = req.body;

    const resolution = await getResolutionHelp(sentence, context, annotatorA, annotatorB);

    res.json(resolution);
  } catch (err) {
    logger.error('Claude resolve error:', err);
    res.status(500).json({ error: 'Failed to get resolution from Claude' });
  }
};

export const generateCard = async (req: AuthRequest, res: Response) => {
  try {
    const { articleTitle, source, biasFindings } = req.body;

    const cardText = await generateCardText(articleTitle, source, biasFindings);

    res.json(cardText);
  } catch (err) {
    logger.error('Claude generate card error:', err);
    res.status(500).json({ error: 'Failed to generate card text' });
  }
};
