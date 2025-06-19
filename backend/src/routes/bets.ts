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

router.get("/", async (req, res) => {
    const page = Math.min(1, Number(req.query.page) || 1);
    const {data, error} = await supabase
        .from('bets')
        .select("*, profiles ( username, avatar_path )")
        .order("created_at", { ascending: false })
        .range((page - 1) * 10, page * 10 - 1)
    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.json(data);
})

export default router;