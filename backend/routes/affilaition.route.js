
// routes/postAffiliationRoutes.js
import express from 'express';
import { getPostsByAffiliation } from '../controllers/affil.controller.js';

const router = express.Router();

// Route to get posts by affiliation
router.get("/:affiliation", getPostsByAffiliation);

export default router;
