import bcrypt from 'bcryptjs';
import pool from '../config/database';

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Seeding database...');

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO annotators (name, email, bio, role, status, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [
      'Admin User',
      'admin@unspun.media',
      'System administrator',
      'admin',
      'active',
      adminPasswordHash
    ]);
    console.log('✓ Admin user created (email: admin@unspun.media, password: admin123)');

    // Create sample annotators
    const annotator1Hash = await bcrypt.hash('password123', 10);
    const annotator2Hash = await bcrypt.hash('password123', 10);

    await client.query(`
      INSERT INTO annotators (name, email, bio, role, status, password_hash)
      VALUES
        ($1, $2, $3, $4, $5, $6),
        ($7, $8, $9, $10, $11, $12)
      ON CONFLICT (email) DO NOTHING
    `, [
      'Sarah Johnson',
      'sarah@unspun.media',
      'Media analyst specializing in political coverage',
      'annotator',
      'active',
      annotator1Hash,
      'Michael Chen',
      'michael@unspun.media',
      'Journalist with focus on media bias research',
      'annotator',
      'active',
      annotator2Hash
    ]);
    console.log('✓ Sample annotators created');

    // Create sample article
    const articleResult = await client.query(`
      INSERT INTO articles (title, url, source, publication_date, cleaned_text, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      'Sample Article: Breaking News Analysis',
      'https://example.com/sample-article',
      'Example News Network',
      '2025-01-15',
      'This is a sample article for testing. The controversial policy has sparked debate among lawmakers. Critics argue the approach is flawed. Supporters claim it will improve outcomes.',
      'queued'
    ]);
    const articleId = articleResult.rows[0].id;
    console.log('✓ Sample article created');

    // Create sample sentences
    const sentences = [
      'This is a sample article for testing.',
      'The controversial policy has sparked debate among lawmakers.',
      'Critics argue the approach is flawed.',
      'Supporters claim it will improve outcomes.'
    ];

    for (let i = 0; i < sentences.length; i++) {
      await client.query(`
        INSERT INTO sentences (article_id, text, position, previous_sentence, next_sentence)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        articleId,
        sentences[i],
        i,
        i > 0 ? sentences[i - 1] : null,
        i < sentences.length - 1 ? sentences[i + 1] : null
      ]);
    }
    console.log('✓ Sample sentences created');

    console.log('\nSeed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin: admin@unspun.media / admin123');
    console.log('  Annotator 1: sarah@unspun.media / password123');
    console.log('  Annotator 2: michael@unspun.media / password123');

  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
