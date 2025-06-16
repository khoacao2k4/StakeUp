import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { verifyToken } from '../middleware/auth'

const router = Router()

router.get('/me', verifyToken, async (req, res) => {
  const user = res.locals.user
  const userId = user.sub
  console.log(user)

  const { data, error } =  await supabase
    .from('profiles')
    .select(`full_name, username, avatar_url`)
    .eq('id', userId)
    .single()

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
})

router.patch('/me', verifyToken, async (req, res) => {
  const user = res.locals.user
  const userId = user.sub

  const { full_name, username } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, username })
    .eq('id', userId)
    .select(`full_name, username, avatar_url`)
    .single()

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
})


export default router
