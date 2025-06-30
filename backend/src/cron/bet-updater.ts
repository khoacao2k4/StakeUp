import cron from 'node-cron';
import { supabase } from '../lib/supabase';

console.log('Cron job service initialized.');

/**
 * This cron job runs every minute to check for new bet placements and notify
 * listening clients to update their stats.
 */
cron.schedule('* * * * *', async () => {
  const jobStartTime = new Date();
  console.log(`[${jobStartTime.toISOString()}] Running scheduled job: Checking for new bet placements...`);

  try {
    // 1. Define the time window for recent placements (e.g., the last 60 seconds).
    // We add a small buffer (5s) to avoid race conditions.
    const oneMinuteAgo = new Date(jobStartTime.getTime() - 65 * 1000).toISOString();

    // 2. Find all unique bet_ids that have had new placements in the last minute.
    // This is the most efficient way to identify which bets need updates.
    const { data: updatedBets, error: fetchError } = await supabase
      .from('bet_placements')
      .select('bet_id')
      .gte('created_at', oneMinuteAgo);

    if (fetchError) {
      throw new Error(`Failed to fetch recent placements: ${fetchError.message}`);
    }

    if (!updatedBets || updatedBets.length === 0) {
      console.log(`[${new Date().toISOString()}] No new placements found. Job complete.`);
      return;
    }

    // 3. Get a unique list of bet IDs
    const uniqueBetIds = [...new Set(updatedBets.map(p => p.bet_id))];

    console.log(`[${new Date().toISOString()}] Found new activity for ${uniqueBetIds.length} bet(s): ${uniqueBetIds.join(', ')}`);

    // 4. Create and send a broadcast notification for each updated bet.
    // We use a Promise.all to send these concurrently for better performance.
    const broadcastPromises = uniqueBetIds.map(betId => {
      const channel = supabase.channel(`stats_changes_${betId}`);
      
      return channel.send({
        type: 'broadcast',
        event: 'stats_updated',
        payload: { message: `Bet ${betId} has new stats. Please refetch.` },
      });
    });

    await Promise.all(broadcastPromises);

    console.log(`[${new Date().toISOString()}] Broadcast notifications sent successfully for all updated bets. Job complete.`);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] An error occurred during the cron job:`, error);
  }
});

export const startBetUpdateCron = () => {
  console.log('Bet update cron job has been started.');
};
