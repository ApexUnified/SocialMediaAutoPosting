import express from "express";
import { body } from "express-validator";
import { auth, checkRole, checkHospitalAccess } from "../middleware/auth.js";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  shareBlog,
  getBlogTranslations,
  getBlogShares,
  generateContent,
  deleteBlog,
} from "../controllers/blogController.js";

import { validateMediaSize } from "../controllers/checkMediaSizeController.js";


const router = express.Router();

// Get all blog posts (public)
router.get("/", getAllBlogs);

// Get blog post by ID (public)
router.get("/:id", getBlogById);

// Create new blog post
router.post(
  "/",
  auth,
  // checkRole('hospital_admin', 'ai_journalist'),
  checkHospitalAccess,
  [
    body("title").trim().notEmpty(),
    body("content").trim().notEmpty(),
    body("category").trim().notEmpty(),
    body("tags").isArray(),
  ],
  createBlog
);

// Update blog post
router.put(
  "/:id",
  auth,
  checkRole("hospital_admin", "ai_journalist"),
  checkHospitalAccess,
  updateBlog
);

// generateContent
router.post(
  "/generate",
  auth,
  checkRole("platform_admin", "ai_journalist"),
  checkHospitalAccess,
  generateContent
);

// Share blog post to social media
router.post(
  "/:id/share",
  auth,
  checkRole("hospital_admin"),
  checkHospitalAccess,
  [body("platforms").isArray().notEmpty()],
  shareBlog
);

// Get blog post translations
router.get("/:id/translations", getBlogTranslations);

// Get blog post social media shares
router.get(
  "/:id/shares",
  auth,
  checkRole("hospital_admin"),
  checkHospitalAccess,
  getBlogShares
);

// New endpoint to get link analytics for a specific social media share
router.get(
  "/:blogId/shares/:shareId/link-analytics",
  auth,
  checkRole("hospital_admin"), // Or other appropriate roles
  checkHospitalAccess // Ensure user has access to the hospital related to the blog
);

// New endpoint to check media size
router.post("/validate-media", validateMediaSize);

router.delete("/:id/:lang",deleteBlog);

export default router;
