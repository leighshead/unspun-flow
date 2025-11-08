import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export const getAnnotators = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT
        a.id, a.name, a.email, a.bio, a.status, a.role, a.created_at,
        COUNT(DISTINCT asg.id) as total_articles,
        COALESCE(AVG(ag.agreement_percentage), 0) as average_agreement
      FROM annotators a
      LEFT JOIN assignments asg ON a.id = asg.annotator_id
      LEFT JOIN agreement_scores ag ON (a.id = ag.annotator_a_id OR a.id = ag.annotator_b_id)
      GROUP BY a.id
      ORDER BY a.name
    `);

    res.json({ annotators: result.rows });
  } catch (err) {
    logger.error('Get annotators error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnnotatorById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, email, bio, status, role, created_at FROM annotators WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotator not found' });
    }

    res.json({ annotator: result.rows[0] });
  } catch (err) {
    logger.error('Get annotator error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnnotatorAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        asg.*,
        a.title, a.source, a.status as article_status,
        (SELECT COUNT(*) FROM sentences WHERE article_id = a.id) as total_sentences,
        (SELECT COUNT(*) FROM annotations ann WHERE ann.annotator_id = asg.annotator_id
         AND ann.sentence_id IN (SELECT id FROM sentences WHERE article_id = a.id)) as completed_sentences
      FROM assignments asg
      JOIN articles a ON asg.article_id = a.id
      WHERE asg.annotator_id = $1
      ORDER BY asg.assigned_date DESC
    `, [id]);

    res.json({ assignments: result.rows });
  } catch (err) {
    logger.error('Get annotator assignments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAnnotator = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, bio, status } = req.body;

    const result = await query(
      `UPDATE annotators
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING id, name, email, bio, status, role`,
      [name, bio, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotator not found' });
    }

    logger.info(`Annotator updated: ${id}`);

    res.json({ annotator: result.rows[0] });
  } catch (err) {
    logger.error('Update annotator error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
