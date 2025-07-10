import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { verifyToken } from '../middleware/auth'
import multer from 'multer';
import { getSignedUrls } from './bets';

const router = Router()

router.get('/me', verifyToken, async (req, res) => {
  const user = res.locals.user
  const userId = user.sub

  const { data, error } =  await supabase
    .from('profiles')
    .select(`id, full_name, username, avatar_path, coin_balance`)
    .eq('id', userId)
    .single()

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // const signedUrl = await getSignedUrls([data.avatar_path]);
  // if (signedUrl.length === 1 && signedUrl[0][1]) {
  //   (data as any).avatar_url = signedUrl[0][1];
  //   //delete data.avatar_path; // TODO: implement this later for frontend
  // }
      
  res.json(data);
})

const upload = multer({ storage: multer.memoryStorage() });

router.patch('/me', verifyToken, upload.single('avatar'), async (req, res) => {
  const userId = res.locals.user.sub;

  const { full_name, username } = req.body;
  let avatar_path: string | null = null;

  // Upload image if present
  if (req.file) {
    const fileExt = req.file.originalname.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      res.status(500).json({ error: uploadError.message });
      return;
    }

    avatar_path = filePath;
  }

  // Update Supabase profile row
  const profileRow: any = { full_name, username };
  if (avatar_path) profileRow.avatar_path = avatar_path;

  const { data: profileData, error: updateError } = await supabase
    .from('profiles')
    .update(profileRow)
    .eq('id', userId)
    .select('id, full_name, username, avatar_path, coin_balance')
    .single();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.json(profileData);
});

router.get('/me/history', verifyToken, async (req, res) => {
  const userId = res.locals.user.sub;
  const { data, error } = await supabase
    .from('bet_placements')
    .select("amount, payout, option_idx, bets ( id, title, options, status )")
    .eq("user_id", userId)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const result = data.map((betInfo: any) => {
    return {
      id: betInfo.bets.id,
      title: betInfo.bets.title,
      status: betInfo.bets.status,
      amount: betInfo.amount,
      option: betInfo.bets.options[betInfo.option_idx],
      payout: betInfo.payout,
      
    }
  })
  res.json(result);
})


export default router
