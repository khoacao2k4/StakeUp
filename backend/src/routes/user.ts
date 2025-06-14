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
    .select(`username, website, avatar_url`)
    .eq('id', userId)
    .single()

  if (error) res.status(500).json({ error: error.message })

  res.json(data);
})


export default router
