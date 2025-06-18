import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../lib/supabase";

const router = Router();

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

export default router;