-- Migration: 007_magazine_images.sql
-- Add image support and enhanced features to magazine_posts table

-- Add new columns for image support and enhanced features
ALTER TABLE magazine_posts 
ADD COLUMN featured_image_url TEXT,
ADD COLUMN gallery_images JSON DEFAULT '[]'::json,
ADD COLUMN author_id UUID REFERENCES profiles(id),
ADD COLUMN read_time_minutes INTEGER DEFAULT 0,
ADD COLUMN excerpt TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN magazine_posts.featured_image_url IS 'Main featured image URL for the post (Supabase Storage)';
COMMENT ON COLUMN magazine_posts.gallery_images IS 'Array of additional image URLs (JSON)';
COMMENT ON COLUMN magazine_posts.author_id IS 'Admin user who created the post';
COMMENT ON COLUMN magazine_posts.read_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN magazine_posts.excerpt IS 'Short excerpt for listings (auto-generated from content if empty)';
COMMENT ON COLUMN magazine_posts.meta_description IS 'SEO meta description (max 160 chars)';
COMMENT ON COLUMN magazine_posts.view_count IS 'Number of times the post has been viewed';

-- Add indexes for performance
CREATE INDEX idx_magazine_author ON magazine_posts(author_id);
CREATE INDEX idx_magazine_created_at ON magazine_posts(created_at DESC);
CREATE INDEX idx_magazine_published_created ON magazine_posts(published, created_at DESC) WHERE published = true;
CREATE INDEX idx_magazine_tags ON magazine_posts USING GIN((tags::jsonb)) WHERE tags IS NOT NULL;

-- Full-text search index for title and content
CREATE INDEX idx_magazine_search ON magazine_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(content_md, '') || ' ' || COALESCE(summary, ''))) WHERE published = true;

-- RLS Policies
-- Enable RLS
ALTER TABLE magazine_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can view published magazine posts" 
ON magazine_posts FOR SELECT 
TO public
USING (published = true);

-- Admin full access  
CREATE POLICY "Admins can manage all magazine posts" 
ON magazine_posts FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_magazine_slug(post_title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(post_title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to estimate reading time (assuming 200 words per minute)
CREATE OR REPLACE FUNCTION estimate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Count words by splitting on whitespace
  word_count := array_length(string_to_array(trim(content), ' '), 1);
  -- Estimate reading time (200 words per minute, minimum 1 minute)
  RETURN GREATEST(1, ROUND(word_count / 200.0));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate excerpt from content
CREATE OR REPLACE FUNCTION generate_excerpt(content TEXT, max_length INTEGER DEFAULT 200)
RETURNS TEXT AS $$
DECLARE
  plain_text TEXT;
  excerpt TEXT;
BEGIN
  -- Remove markdown syntax (basic cleanup)
  plain_text := regexp_replace(content, '#{1,6}\s+', '', 'g'); -- Remove headers
  plain_text := regexp_replace(plain_text, '\*\*(.*?)\*\*', '\1', 'g'); -- Remove bold
  plain_text := regexp_replace(plain_text, '\*(.*?)\*', '\1', 'g'); -- Remove italic
  plain_text := regexp_replace(plain_text, '\[(.*?)\]\(.*?\)', '\1', 'g'); -- Remove links
  plain_text := regexp_replace(plain_text, '`(.*?)`', '\1', 'g'); -- Remove code
  plain_text := regexp_replace(plain_text, '\n+', ' ', 'g'); -- Replace newlines with spaces
  plain_text := trim(plain_text);
  
  -- Truncate to max_length and add ellipsis if needed
  IF length(plain_text) > max_length THEN
    excerpt := substring(plain_text from 1 for max_length);
    -- Try to break at word boundary
    excerpt := substring(excerpt from 1 for length(excerpt) - position(' ' in reverse(excerpt)));
    excerpt := excerpt || '...';
  ELSE
    excerpt := plain_text;
  END IF;
  
  RETURN excerpt;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate slug, reading time, and excerpt
CREATE OR REPLACE FUNCTION magazine_posts_auto_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_magazine_slug(NEW.title);
    
    -- Ensure slug uniqueness
    WHILE EXISTS (SELECT 1 FROM magazine_posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
      NEW.slug := NEW.slug || '-' || extract(epoch from now())::text;
    END LOOP;
  END IF;
  
  -- Auto-calculate reading time
  IF NEW.content_md IS NOT NULL THEN
    NEW.read_time_minutes := estimate_reading_time(NEW.content_md);
  END IF;
  
  -- Auto-generate excerpt if not provided
  IF (NEW.excerpt IS NULL OR NEW.excerpt = '') AND NEW.content_md IS NOT NULL THEN
    NEW.excerpt := generate_excerpt(NEW.content_md, 200);
  END IF;
  
  -- Update updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS magazine_posts_auto_fields_trigger ON magazine_posts;
CREATE TRIGGER magazine_posts_auto_fields_trigger
  BEFORE INSERT OR UPDATE ON magazine_posts
  FOR EACH ROW
  EXECUTE FUNCTION magazine_posts_auto_fields();
