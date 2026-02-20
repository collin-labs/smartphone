// ============================================
// LINKEDIN HANDLERS — colar no server/main.js
// ============================================

registerHandler('linkedin_get_profile', async (phone) => {
  const profile = await dbQuery('SELECT * FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  return { ok: true, profile: profile[0] || null };
});

registerHandler('linkedin_get_feed', async (phone) => {
  const posts = await dbQuery(`
    SELECT p.*, pr.name, pr.headline, pr.avatar, pr.phone as author_phone,
      (SELECT COUNT(*) FROM smartphone_linkedin_likes WHERE post_id = p.id) as likes_count,
      CASE WHEN EXISTS(
        SELECT 1 FROM smartphone_linkedin_likes l 
        JOIN smartphone_linkedin_profiles me ON me.phone = ? AND l.profile_id = me.id
        WHERE l.post_id = p.id
      ) THEN 1 ELSE 0 END as liked
    FROM smartphone_linkedin_posts p
    JOIN smartphone_linkedin_profiles pr ON p.profile_id = pr.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `, [phone]);
  return { ok: true, posts };
});

registerHandler('linkedin_toggle_like', async (phone, { postId }) => {
  const me = await dbQuery('SELECT id FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  if (!me[0]) return { ok: false };
  const existing = await dbQuery('SELECT id FROM smartphone_linkedin_likes WHERE profile_id = ? AND post_id = ?', [me[0].id, postId]);
  if (existing[0]) {
    await dbQuery('DELETE FROM smartphone_linkedin_likes WHERE id = ?', [existing[0].id]);
    await dbQuery('UPDATE smartphone_linkedin_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [postId]);
  } else {
    await dbInsert('INSERT INTO smartphone_linkedin_likes (profile_id, post_id) VALUES (?, ?)', [me[0].id, postId]);
    await dbQuery('UPDATE smartphone_linkedin_posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
  }
  return { ok: true };
});

registerHandler('linkedin_create_post', async (phone, { content }) => {
  const me = await dbQuery('SELECT id FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  if (!me[0]) return { ok: false };
  const id = await dbInsert('INSERT INTO smartphone_linkedin_posts (profile_id, content) VALUES (?, ?)', [me[0].id, content]);
  return { ok: true, postId: id };
});

registerHandler('linkedin_get_jobs', async (phone) => {
  const jobs = await dbQuery(`
    SELECT j.*, pr.name as poster_name, pr.avatar as poster_avatar,
      CASE WHEN EXISTS(
        SELECT 1 FROM smartphone_linkedin_applications a
        JOIN smartphone_linkedin_profiles me ON me.phone = ? AND a.applicant_id = me.id
        WHERE a.job_id = j.id
      ) THEN 1 ELSE 0 END as applied
    FROM smartphone_linkedin_jobs j
    JOIN smartphone_linkedin_profiles pr ON j.poster_id = pr.id
    WHERE j.status = 'open'
    ORDER BY j.created_at DESC
  `, [phone]);
  return { ok: true, jobs };
});

registerHandler('linkedin_apply_job', async (phone, { jobId, message }) => {
  const me = await dbQuery('SELECT id FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  if (!me[0]) return { ok: false };
  await dbInsert('INSERT IGNORE INTO smartphone_linkedin_applications (job_id, applicant_id, message) VALUES (?, ?, ?)', [jobId, me[0].id, message || '']);
  await dbQuery('UPDATE smartphone_linkedin_jobs SET applicants_count = applicants_count + 1 WHERE id = ?', [jobId]);
  return { ok: true };
});

registerHandler('linkedin_get_connections', async (phone) => {
  const me = await dbQuery('SELECT id FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  if (!me[0]) return { ok: true, connections: [] };
  const connections = await dbQuery(`
    SELECT pr.*, c.status,
      CASE WHEN c.requester_id = ? THEN 'sent' ELSE 'received' END as direction
    FROM smartphone_linkedin_connections c
    JOIN smartphone_linkedin_profiles pr ON pr.id = CASE WHEN c.requester_id = ? THEN c.target_id ELSE c.requester_id END
    WHERE c.requester_id = ? OR c.target_id = ?
  `, [me[0].id, me[0].id, me[0].id, me[0].id]);
  return { ok: true, connections };
});

registerHandler('linkedin_send_connection', async (phone, { targetId }) => {
  const me = await dbQuery('SELECT id FROM smartphone_linkedin_profiles WHERE phone = ?', [phone]);
  if (!me[0]) return { ok: false };
  await dbInsert('INSERT IGNORE INTO smartphone_linkedin_connections (requester_id, target_id, status) VALUES (?, ?, "pending")', [me[0].id, targetId]);
  return { ok: true };
});

registerHandler('linkedin_accept_connection', async (phone, { connectionId }) => {
  await dbQuery('UPDATE smartphone_linkedin_connections SET status = "accepted" WHERE id = ?', [connectionId]);
  return { ok: true };
});

registerHandler('linkedin_reject_connection', async (phone, { connectionId }) => {
  await dbQuery('DELETE FROM smartphone_linkedin_connections WHERE id = ?', [connectionId]);
  return { ok: true };
});

registerHandler('linkedin_get_professionals', async (phone) => {
  const profiles = await dbQuery('SELECT * FROM smartphone_linkedin_profiles ORDER BY connections_count DESC LIMIT 20');
  return { ok: true, profiles };
});
