import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../lib/supabase";

const router = Router();
const cache = new Map();
const CACHE_EXPIRATION_TIME = 24 * 60 * 60; // 24 hour

/** HELPER FUNCTIONS  **/
export async function getSignedUrls(paths: string[]) {
  const now = Date.now();
  const signedUrls = [];
  const pathFetch = []; //list of urls to call supabase

  // Check cache first
  for (const path of paths) {
    if (!path) continue;
    const cachedInfo = cache.get(path);
    if (cachedInfo && cachedInfo.expiresAt > now) {
      signedUrls.push([path, cachedInfo.url]);
    } else {
      pathFetch.push(path);
    }
  }

  // Fetch new URLs for paths not in cache or expired
  if (pathFetch.length > 0) {
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrls(pathFetch, CACHE_EXPIRATION_TIME);

    if (error) throw error;

    // Add new URLs to cache and response
    for (const { path, signedUrl } of data) {
      cache.set(path, { url: signedUrl, expiresAt: now + CACHE_EXPIRATION_TIME * 1000 });
      signedUrls.push([path, signedUrl]);
    }
  }

  return signedUrls;
}

async function getParticipationCounts(betIds: string[]) {
  const { data, error } = await supabase
    .from('bet_participant_counts')
    .select('*')
    .in('bet_id', betIds);
  if (error) throw error;

  const countsMap = Object.fromEntries(
    data.map((c) => [c.bet_id, c.participants])
  );
  return countsMap;
}

/* ALL BETs API */
router.post("/", verifyToken, async (req, res) => {
    const userId = res.locals.user.sub;
    
    const betRow = {
        ...req.body,
        "creator_id": userId,
        "status": "open"
    }
    const { data: newBet, error: updateError } = await supabase
        .from('bets')
        .insert(betRow)
        .select()
        .single()
    if (updateError) {
        res.status(500).json({ error: updateError.message });
        return;
    }
    res.status(201).json(newBet);
})


router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const {data, error} = await supabase
    .from('bets')
    .select("*, profiles ( username, avatar_path )")
    .order("created_at", { ascending: false })
    .range((page - 1) * 10, page * 10 - 1)
  if (error) {
      res.status(500).json({ error: error.message });
      return;
  }

  // Fetch participation counts from the view
  const betIds = data.map((bet) => bet.id);
  const participantsData = await getParticipationCounts(betIds);

  data.forEach((bet) => {
    bet.participant_count = participantsData[bet.id] || 0;
  });

  // Fetch signed urls
  const paths = data.map((bet) => bet.profiles.avatar_path);
  const signedUrls = await getSignedUrls(paths);
  const signedUrlsMap = Object.fromEntries(signedUrls);

  data.forEach((bet) => {
    delete bet.options;
    delete bet.creator_id;
    delete bet.settled_option;
    if (bet.profiles.avatar_path) {
      const signedUrl = signedUrlsMap[bet.profiles.avatar_path];
      if (signedUrl) {
          bet.profiles.avatar_url = signedUrl;
      }
    };
    delete bet.profiles.avatar_path;
  });
  res.json(data);
})


/* SINGLE BET API */
router.get("/:bet_id", async (req, res) => {
    const { data, error } = await supabase
      .from('bets')
      .select("*, profiles ( id, username, avatar_path )")
      .eq("id", req.params.bet_id)
      .single()

    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    if (!data.profiles.avatar_path) { // skip get avatar
      res.json(data);
      return;
    }
    const signedUrl = await getSignedUrls([data.profiles.avatar_path]);
    if (signedUrl[0][1]) {
      data.profiles.avatar_url = signedUrl[0][1];
      delete data.profiles.avatar_path;
    }
    res.json(data);
})

router.patch("/:bet_id", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('bets')
    .update(req.body)
    .eq("id", req.params.bet_id)
    .select()
    .single()
    
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
})

router.get("/:bet_id/placement", verifyToken, async (req, res) => {
  const userId = res.locals.user.sub;
  // Fetch current user's placement
  const { data: placement, error: placementError } = await supabase
    .from('bet_placements')
    .select('option_idx, amount, payout')
    .eq('bet_id', req.params.bet_id)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (placementError) {
    res.status(500).json({ error: placementError.message });
    return;
  }
  res.json(placement);
})

router.post("/:bet_id/placement", verifyToken, async (req, res) => {
  const userId = res.locals.user.sub;
  const { amount, option_idx } = req.body;
  const bet_id = req.params.bet_id;
  try {
    const { data, error } = await supabase.rpc('place_bet', {
      p_bet_id: bet_id,
      p_user_id: userId,
      p_option_idx: option_idx,
      p_amount: amount,
    });
    
    if (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    console.log(data);
    if (data.error) {
      let userMessage = "Could not place bet.";
      let statusCode = 400; // Bad Request by default

      if (data.error.includes('insufficient_balance')) {
        userMessage = "You do not have enough coins to place this bet.";
      } else if (data.error.includes('bet_closed')) {
        userMessage = "This bet is already closed.";
      } else if (data.error.includes('user_already_bet')) {
        userMessage = "You have already placed a bet on this event.";
      } else {
        console.error("Database transaction error:", data.error);
        statusCode = 500; // Internal Server Error
      }
      res.status(statusCode).json({ error: userMessage });
    }
    // Return the updated bet placement
    res.status(201).json(data);
  } catch (err) {
    console.error("API error in /placement:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
})

router.post("/:bet_id/settle", verifyToken, async (req, res) => {
  const { option_idx } = req.body;
  const bet_id = req.params.bet_id;
  const userId = res.locals.user.sub;

  // check if user is the creator of the bet
  const { data: betData, error: betError } = await supabase
    .from('bets')
    .select('creator_id')
    .eq('id', bet_id)
    .maybeSingle();
  if (betError) {
    console.log(betError.message);
    res.status(500).json({ error: betError.message });
  }
  if (!betData || betData.creator_id !== userId) {
    res.status(403).json({ error: 'You are not the creator of this bet.' });
    return;
  }
  console.log("time to setttle");

  // call supabase RPC
  const { data, error } = await supabase.rpc('settle_bet', {
    p_bet_id: bet_id,
    p_winning_option_idx: option_idx,
  });

  if (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
  if (data.error) res.status(400).json({ error: data.error });

  console.log("settle bet completed ", data);
  res.status(200).json(data);
})

export default router;