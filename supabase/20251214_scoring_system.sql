-- 1. Add Streak Columns to Profiles (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_days int DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_report_date date;

-- 2. Ensure people_count exists in reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS people_count int DEFAULT 1;

-- 3. Create/Replace Function for Dynamic Scoring
CREATE OR REPLACE FUNCTION public.handle_new_report_score()
RETURNS TRIGGER AS $$
DECLARE
  current_streak int;
  last_date date;
  report_date date;
  multiplier int;
  points_earned int;
BEGIN
  -- Get current user data
  SELECT streak_days, last_report_date INTO current_streak, last_date
  FROM public.profiles WHERE id = NEW.user_id;

  report_date := NEW.created_at::date;
  current_streak := COALESCE(current_streak, 0);

  -- 1. Determine Streak Logic
  IF last_date IS NOT NULL AND last_date = report_date THEN
    -- Same day reporting:
    -- Streak count doesn't increase (only increases once per day)
    -- But we still award points based on the *current* streak level
    NULL; 
  ELSIF last_date IS NOT NULL AND last_date = report_date - 1 THEN
    -- Consecutive day (Yesterday vs Today):
    -- Increment streak
    current_streak := current_streak + 1;
  ELSE
    -- Broken streak or first time:
    -- Reset to 1
    current_streak := 1;
  END IF;

  -- 2. Calculate Multiplier
  -- Rule: Day 1 -> 5 pts, Day 2 -> 6 pts...
  -- Formula: 4 + Streak
  -- Streak 1: 4+1 = 5
  -- Streak 2: 4+2 = 6
  multiplier := 4 + current_streak;
  
  -- 3. Calculate Points for this report
  points_earned := COALESCE(NEW.people_count, 1) * multiplier;

  -- 4. Update Profile
  UPDATE public.profiles
  SET 
    points = COALESCE(points, 0) + points_earned,
    streak_days = current_streak,
    last_report_date = report_date
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop and Recreate Trigger
DROP TRIGGER IF EXISTS on_report_created_score on public.reports;

CREATE TRIGGER on_report_created_score
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_report_score();
