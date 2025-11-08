import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import logger from '../utils/logger';

export const createAnnotation = async (req: AuthRequest, res: Response) => {
  try {
    const { sentenceId, biasTags, confidence, notes } = req.body;
    const annotatorId = req.user!.id;

    const result = await query(
      `INSERT INTO annotations (sentence_id, annotator_id, bias_tags, confidence, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (sentence_id, annotator_id)
       DO UPDATE SET bias_tags = $3, confidence = $4, notes = $5, timestamp = NOW()
       RETURNING *`,
      [sentenceId, annotatorId, biasTags, confidence, notes || null]
    );

    logger.info(`Annotation created: ${result.rows[0].id}`);

    res.status(201).json({ annotation: result.rows[0] });
  } catch (err) {
    logger.error('Create annotation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkSaveAnnotations = async (req: AuthRequest, res: Response) => {
  try {
    const { annotations } = req.body;
    const annotatorId = req.user!.id;

    const results = [];

    for (const ann of annotations) {
      const result = await query(
        `INSERT INTO annotations (sentence_id, annotator_id, bias_tags, confidence, notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (sentence_id, annotator_id)
         DO UPDATE SET bias_tags = $3, confidence = $4, notes = $5, timestamp = NOW()
         RETURNING *`,
        [ann.sentenceId, annotatorId, ann.biasTags, ann.confidence, ann.notes || null]
      );
      results.push(result.rows[0]);
    }

    logger.info(`Bulk annotations saved: ${results.length}`);

    res.json({ annotations: results });
  } catch (err) {
    logger.error('Bulk save annotations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSentenceAnnotations = async (req: AuthRequest, res: Response) => {
  try {
    const { sentenceId } = req.params;

    const result = await query(
      `SELECT ann.*, a.name as annotator_name, a.email as annotator_email
       FROM annotations ann
       JOIN annotators a ON ann.annotator_id = a.id
       WHERE ann.sentence_id = $1`,
      [sentenceId]
    );

    res.json({ annotations: result.rows });
  } catch (err) {
    logger.error('Get sentence annotations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArticleAgreement = async (req: AuthRequest, res: Response) => {
  try {
    const { articleId } = req.params;

    // Get all sentences for the article
    const sentencesResult = await query(
      'SELECT id FROM sentences WHERE article_id = $1 ORDER BY position',
      [articleId]
    );

    const sentences = sentencesResult.rows;
    let agreedCount = 0;
    const disagreements: any[] = [];

    for (const sentence of sentences) {
      const annsResult = await query(
        'SELECT * FROM annotations WHERE sentence_id = $1',
        [sentence.id]
      );

      const annotations = annsResult.rows;

      if (annotations.length === 2) {
        const [ann1, ann2] = annotations;
        const tags1 = ann1.bias_tags.sort();
        const tags2 = ann2.bias_tags.sort();

        const agreed = JSON.stringify(tags1) === JSON.stringify(tags2);

        if (agreed) {
          agreedCount++;
        } else {
          disagreements.push({
            sentenceId: sentence.id,
            annotator1: { biasTags: tags1, confidence: ann1.confidence, notes: ann1.notes },
            annotator2: { biasTags: tags2, confidence: ann2.confidence, notes: ann2.notes },
          });
        }
      }
    }

    const agreementPercentage = sentences.length > 0
      ? (agreedCount / sentences.length) * 100
      : 0;

    res.json({
      totalSentences: sentences.length,
      agreedSentences: agreedCount,
      agreementPercentage: agreementPercentage.toFixed(2),
      disagreements,
    });
  } catch (err) {
    logger.error('Get agreement error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { sentenceId, comment } = req.body;
    const annotatorId = req.user!.id;

    const result = await query(
      'INSERT INTO discussions (sentence_id, annotator_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [sentenceId, annotatorId, comment]
    );

    logger.info(`Discussion comment created: ${result.rows[0].id}`);

    res.status(201).json({ discussion: result.rows[0] });
  } catch (err) {
    logger.error('Create discussion error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSentenceDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const { sentenceId } = req.params;

    const result = await query(
      `SELECT d.*, a.name as annotator_name
       FROM discussions d
       JOIN annotators a ON d.annotator_id = a.id
       WHERE d.sentence_id = $1
       ORDER BY d.created_at`,
      [sentenceId]
    );

    res.json({ discussions: result.rows });
  } catch (err) {
    logger.error('Get discussions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
