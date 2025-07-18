import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospital.js';
import blogRoutes from './routes/blog.js';
import reservationRoutes from './routes/reservation.js';
import couponRoutes from './routes/coupon.js';
import subscriptionRoutes from './routes/subscription.js';
import { pollAyrshareUpdate } from './services/socialMediaService.js';
import Blog from './models/Blog.js';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("MongoDB connected to:", mongoose.connection.name);
      
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 




 const startAyrsharePolling = () => {
  setInterval(async () => {
    try {
      const blogs = await Blog.find({
        isActive: true,
        socialMediaShares: {
          $elemMatch: {
            postId: { $ne: null },
            postUrl: null,
            status: { $ne: "failed" }
          }
        }
      });

      if(blogs.length > 0)
      {
        for (const blog of blogs) {
        let updated = false;

        for (let share of blog.socialMediaShares) {
          if (share.postId && !share.postUrl) {
            const update = await pollAyrshareUpdate(share.postId, share.platform);
            

            if (update) {
              share.sharedContent = update.sharedContent || share.sharedContent;
              share.postUrl = update.postUrl || share.postUrl;
              updated = true;

              console.log(`✅ Updated share for ${share.platform} in blog: ${blog.title}`);
            }
          }
        }

        if (updated) {
          await blog.save();
        }
      }
      }else{
        console.log('No blog posts found with social media shares.');
      }
    } catch (err) {
      console.error('❌ Error during Ayrshare polling:', err);
    }
  }, 60 * 2000); // Every 2 minute
};



startAyrsharePolling();