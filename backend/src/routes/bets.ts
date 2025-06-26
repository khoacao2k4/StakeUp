import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../lib/supabase";

const router = Router();
const cache = new Map();
const CACHE_EXPIRATION_TIME = 24 * 60 * 60; // 24 hour

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
    res.json(newBet);
})

async function getSignedUrls(paths: string[]) {
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

router.get("/:bet_id", async (req, res) => {
    const { data, error } = await supabase
      .from('bets')
      .select("*, profiles ( username, avatar_path )")
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

export default router;