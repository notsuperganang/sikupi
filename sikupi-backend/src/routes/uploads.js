const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, deleteFile, getPublicUrl } = require('../config/storage');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Image processing utility
const processImage = async (buffer, options = {}) => {
  const { width = 800, height = 600, quality = 80 } = options;
  
  return await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer();
};

// Upload single image
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select an image to upload'
      });
    }

    const { folder = 'general' } = req.body;
    const fileName = `${folder}/${req.user.id}/${uuidv4()}-${req.file.originalname}`;

    // Process image
    const processedImage = await processImage(req.file.buffer);

    // Upload to Supabase Storage
    await uploadFile(processedImage, fileName);
    const publicUrl = getPublicUrl(fileName);

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: publicUrl,
        fileName,
        originalName: req.file.originalname,
        size: processedImage.length
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Could not upload image'
    });
  }
});

// Upload multiple images
router.post('/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files provided',
        message: 'Please select at least one image to upload'
      });
    }

    const { folder = 'general' } = req.body;
    const uploadedImages = [];

    for (const file of files) {
      try {
        const fileName = `${folder}/${req.user.id}/${uuidv4()}-${file.originalname}`;

        // Process image
        const processedImage = await processImage(file.buffer);

        // Upload to Supabase Storage
        await uploadFile(processedImage, fileName);
        const publicUrl = getPublicUrl(fileName);

        uploadedImages.push({
          url: publicUrl,
          fileName,
          originalName: file.originalname,
          size: processedImage.length
        });
      } catch (uploadError) {
        console.error('Individual file upload error:', uploadError);
        // Continue with other files
        continue;
      }
    }

    res.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Could not upload images'
    });
  }
});

// Upload profile image
router.post('/profile-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a profile image to upload'
      });
    }

    const fileName = `profiles/${req.user.id}/${uuidv4()}-profile.jpg`;

    // Process image with smaller dimensions for profile
    const processedImage = await processImage(req.file.buffer, {
      width: 300,
      height: 300,
      quality: 85
    });

    // Upload to Supabase Storage
    await uploadFile(processedImage, fileName);
    const publicUrl = getPublicUrl(fileName);

    // Update user profile with new image URL
    const { supabase } = require('../config/supabase');
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        error: 'Profile update failed',
        message: 'Image uploaded but could not update profile'
      });
    }

    res.json({
      message: 'Profile image updated successfully',
      image: {
        url: publicUrl,
        fileName
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Could not upload profile image'
    });
  }
});

// Upload AI assessment image
router.post('/ai-assessment', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select an image for AI assessment'
      });
    }

    const fileName = `ai-assessments/${req.user.id}/${uuidv4()}-${req.file.originalname}`;

    // Process image for AI assessment (keep higher quality)
    const processedImage = await processImage(req.file.buffer, {
      width: 1024,
      height: 768,
      quality: 90
    });

    // Upload to Supabase Storage
    await uploadFile(processedImage, fileName);
    const publicUrl = getPublicUrl(fileName);

    res.json({
      message: 'Image uploaded for AI assessment',
      image: {
        url: publicUrl,
        fileName,
        originalName: req.file.originalname,
        size: processedImage.length
      }
    });
  } catch (error) {
    console.error('AI assessment image upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Could not upload image for AI assessment'
    });
  }
});

// Delete image
router.delete('/image', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        error: 'Missing file name',
        message: 'Please provide the file name to delete'
      });
    }

    // Basic security check - ensure user can only delete their own files
    if (!fileName.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own files'
      });
    }

    await deleteFile(fileName);

    res.json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'Could not delete image'
    });
  }
});

// Upload product certification documents
router.post('/certification', authenticateToken, upload.array('documents', 5), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files provided',
        message: 'Please select certification documents to upload'
      });
    }

    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        error: 'Missing product ID',
        message: 'Please provide a product ID'
      });
    }

    const uploadedDocs = [];

    for (const file of files) {
      try {
        const fileName = `certifications/${req.user.id}/${product_id}/${uuidv4()}-${file.originalname}`;

        // For documents, we might not need image processing
        const fileBuffer = file.mimetype.startsWith('image/') 
          ? await processImage(file.buffer, { quality: 95 })
          : file.buffer;

        // Upload to Supabase Storage
        await uploadFile(fileBuffer, fileName);
        const publicUrl = getPublicUrl(fileName);

        uploadedDocs.push({
          url: publicUrl,
          fileName,
          originalName: file.originalname,
          size: fileBuffer.length
        });
      } catch (uploadError) {
        console.error('Document upload error:', uploadError);
        continue;
      }
    }

    res.json({
      message: `${uploadedDocs.length} certification documents uploaded successfully`,
      documents: uploadedDocs
    });
  } catch (error) {
    console.error('Certification upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Could not upload certification documents'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds the 10MB limit'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum number of files exceeded'
      });
    }
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router;