import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { segmentIntoSentences, cleanHtml } from '../utils/sentenceSegmentation';
import logger from '../utils/logger';

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, url, source, publicationDate, rawHtml, content } = req.body;

    // Clean and process content
    const cleanedText = rawHtml ? cleanHtml(rawHtml) : content;
    const sentences = segmentIntoSentences(cleanedText);

    // Insert article
    const articleResult = await query(
      `INSERT INTO articles (title, url, source, publication_date, raw_html, cleaned_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, url, source, publicationDate, rawHtml || null, cleanedText, 'queued']
    );

    const article = articleResult.rows[0];

    // Insert sentences
    for (let i = 0; i < sentences.length; i++) {
      await query(
        `INSERT INTO sentences (article_id, text, position, previous_sentence, next_sentence)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          article.id,
          sentences[i],
          i,
          i > 0 ? sentences[i - 1] : null,
          i < sentences.length - 1 ? sentences[i + 1] : null,
        ]
      );
    }

    logger.info(`Article created: ${article.id}`);

    res.status(201).json({
      article,
      sentenceCount: sentences.length,
    });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Article URL already exists' });
    }
    logger.error('Create article error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    const { status, source, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT a.*,
        (SELECT COUNT(*) FROM sentences WHERE article_id = a.id) as sentence_count,
        (SELECT json_agg(json_build_object('id', an.id, 'name', an.name, 'email', an.email))
         FROM assignments asg
         JOIN annotators an ON asg.annotator_id = an.id
         WHERE asg.article_id = a.id) as annotators
      FROM articles a
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (source) {
      queryText += ` AND a.source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    queryText += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      articles: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    logger.error('Get articles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArticleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const articleResult = await query('SELECT * FROM articles WHERE id = $1', [id]);
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const sentencesResult = await query(
      'SELECT * FROM sentences WHERE article_id = $1 ORDER BY position',
      [id]
    );

    res.json({
      article: articleResult.rows[0],
      sentences: sentencesResult.rows,
    });
  } catch (err) {
    logger.error('Get article error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignAnnotators = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { annotatorIds, dueDate } = req.body;

    if (annotatorIds.length !== 2) {
      return res.status(400).json({ error: 'Exactly 2 annotators required' });
    }

    // Create assignments
    for (const annotatorId of annotatorIds) {
      await query(
        `INSERT INTO assignments (article_id, annotator_id, due_date, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (article_id, annotator_id) DO NOTHING`,
        [id, annotatorId, dueDate || null, 'pending']
      );
    }

    // Update article status
    await query(
      'UPDATE articles SET status = $1 WHERE id = $2',
      ['assigned', id]
    );

    logger.info(`Annotators assigned to article ${id}`);

    res.json({ message: 'Annotators assigned successfully' });
  } catch (err) {
    logger.error('Assign annotators error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM articles WHERE id = $1', [id]);

    logger.info(`Article deleted: ${id}`);

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    logger.error('Delete article error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'queued') as queued,
        COUNT(*) FILTER (WHERE status IN ('assigned', 'in_progress')) as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'ready_to_publish') as ready_to_publish,
        COUNT(*) FILTER (WHERE status = 'needs_review') as needs_discussion
      FROM articles
    `);

    res.json(stats.rows[0]);
  } catch (err) {
    logger.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
