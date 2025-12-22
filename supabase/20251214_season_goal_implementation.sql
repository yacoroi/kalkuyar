-- 1. Add Season Columns to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS season_contacts int DEFAULT 0,
ADD COLUMN IF NOT EXISTS season_target int DEFAULT 15;

-- 2. Update Trigger to increment season_contacts
CREATE OR REPLACE FUNCTION public.handle_new_report_score()
RETURNS TRIGGER AS $$
DECLARE
  current_streak int;
  last_date date;
  report_date date;
  multiplier int;
  points_earned int;
  people_added int;
BEGIN
  -- Get current user data
  SELECT streak_days, last_report_date INTO current_streak, last_date
  FROM public.profiles WHERE id = NEW.user_id;

  report_date := NEW.created_at::date;
  current_streak := COALESCE(current_streak, 0);
  people_added := COALESCE(NEW.people_count, 1);

  -- 1. Determine Streak Logic
  IF last_date IS NOT NULL AND last_date = report_date THEN
    -- Same day reporting:
    -- Streak count doesn't increase (only increases once per day)
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
  multiplier := 4 + current_streak;
  
  -- 3. Calculate Points for this report
  points_earned := people_added * multiplier;

  -- 4. Update Profile
  UPDATE public.profiles
  SET 
    points = COALESCE(points, 0) + points_earned,
    season_contacts = COALESCE(season_contacts, 0) + people_added, -- Increment season contacts
    streak_days = current_streak,
    last_report_date = report_date
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update RPC to reset season_contacts and set new target
CREATE OR REPLACE FUNCTION public.archive_and_reset_season(p_period_name text, p_season_target int DEFAULT 15)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert snapshot
    INSERT INTO public.leaderboard_history (
        period_name,
        user_id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank
    )
    SELECT 
        p_period_name,
        id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank() OVER (ORDER BY points DESC)::integer
    FROM public.profiles
    WHERE points > 0;

    -- Reset points and season contacts, update target
    UPDATE public.profiles
    SET 
        points = 0,
        season_contacts = 0,
        season_target = p_season_target;
    -- Note: Removed "WHERE points > 0" to ensure EVERYONE gets the new target and reset contacts even if they had 0 points.
    -- This is safe because we are setting values, not deleting rows.
END;
$$;

-- Grant execute to updated RPC
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO postgres;
