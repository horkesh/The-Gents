import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import type { ParticipantProfile, ParticipantStats } from '@the-toast/shared';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (client) return client;
  if (!config.supabase.url || !config.supabase.serviceKey) {
    return null;
  }
  client = createClient(config.supabase.url, config.supabase.serviceKey);
  logger.info('supabase', 'Client initialized');
  return client;
}

function isConfigured(): boolean {
  return !!getClient();
}

/**
 * Creates a session record. Returns session ID or null.
 */
export async function createSession(
  code: string,
  hostIds: string[]
): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('sessions')
      .insert({ code, host_ids: hostIds })
      .select('id')
      .single();

    if (error) throw error;
    logger.info('supabase', `Created session ${data.id} for room ${code}`);
    return data.id;
  } catch (err) {
    logger.error('supabase', 'Failed to create session', err);
    return null;
  }
}

/**
 * Ends a session (sets ended_at, title, scene_location).
 */
export async function endSession(
  code: string,
  title: string,
  sceneLocation: string
): Promise<void> {
  const db = getClient();
  if (!db) return;

  try {
    const { error } = await db
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        title,
        scene_location: sceneLocation,
      })
      .eq('code', code);

    if (error) throw error;
    logger.info('supabase', `Ended session for room ${code}`);
  } catch (err) {
    logger.error('supabase', 'Failed to end session', err);
  }
}

/**
 * Saves a participant profile to the database.
 */
export async function saveProfile(
  sessionCode: string,
  profile: ParticipantProfile
): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  try {
    // Look up session ID by code
    const { data: session } = await db
      .from('sessions')
      .select('id')
      .eq('code', sessionCode)
      .single();

    if (!session) return null;

    const { data, error } = await db
      .from('profiles')
      .insert({
        session_id: session.id,
        name: profile.name,
        photo_url: profile.photoUrl,
        portrait_url: profile.portraitUrl,
        alias: profile.alias,
        traits: profile.traits,
        dossier: profile.dossier,
        role: profile.role,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    logger.error('supabase', 'Failed to save profile', err);
    return null;
  }
}

/**
 * Saves a group snap composite image.
 */
export async function saveSnapshot(
  sessionCode: string,
  imageUrl: string,
  act: number
): Promise<void> {
  const db = getClient();
  if (!db) return;

  try {
    const { data: session } = await db
      .from('sessions')
      .select('id')
      .eq('code', sessionCode)
      .single();

    if (!session) return;

    const { error } = await db
      .from('snapshots')
      .insert({
        session_id: session.id,
        image_url: imageUrl,
        act,
      });

    if (error) throw error;
    logger.info('supabase', `Saved snapshot for room ${sessionCode} act ${act}`);
  } catch (err) {
    logger.error('supabase', 'Failed to save snapshot', err);
  }
}

/**
 * Saves a participant's wrapped card data.
 */
export async function saveWrapped(
  sessionCode: string,
  participantId: string,
  stats: ParticipantStats,
  lorekeeperNote: string
): Promise<void> {
  const db = getClient();
  if (!db) return;

  try {
    const { data: session } = await db
      .from('sessions')
      .select('id')
      .eq('code', sessionCode)
      .single();

    if (!session) return;

    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('session_id', session.id)
      .eq('name', participantId)
      .single();

    const { error } = await db
      .from('wrapped')
      .insert({
        session_id: session.id,
        profile_id: profile?.id || null,
        stats,
        lorekeeper_note: lorekeeperNote,
      });

    if (error) throw error;
  } catch (err) {
    logger.error('supabase', 'Failed to save wrapped card', err);
  }
}

export { isConfigured };
