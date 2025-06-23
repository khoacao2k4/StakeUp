import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { verifyToken } from '../middleware/auth'
import multer from 'multer';

const router = Router()

router.get('/me', verifyToken, async (req, res) => {
  const user = res.locals.user
  const userId = user.sub

  const { data, error } =  await supabase
    .from('profiles')
    .select(`full_name, username, avatar_path, coin_balance`)
    .eq('id', userId)
    .single()

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
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
    .select('full_name, username, avatar_path')
    .single();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  // // Generate signed URL for avatar
  // let avatar_url: string | null = null;
  // if (profileData.avatar_url) {
  //   const { data: signed, error: signedError } = await supabase.storage
  //     .from('avatars')
  //     .createSignedUrl(profileData.avatar_url, 60 * 60); // valid for 1 hour

  //   if (signedError) {
  //     res.status(500).json({ error: signedError.message });
  //     return;
  //   }

  //   avatar_url = signed.signedUrl;
  // }

  res.json(profileData);
});


export default router
