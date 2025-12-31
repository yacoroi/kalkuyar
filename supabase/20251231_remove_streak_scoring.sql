-- Fix: Remove streak from scoring - use fixed 5 points per person
CREATE OR REPLACE FUNCTION public.handle_new_report_score()
RETURNS TRIGGER AS $$
DECLARE
  report_date date;
  points_earned int;
  people_added int;
BEGIN
  report_date := NEW.created_at::date;
  people_added := COALESCE(NEW.people_count, 1);
  
  -- Fixed 5 points per person (no streak bonus)
  points_earned := people_added * 5;

  -- Update Profile
  UPDATE public.profiles
  SET 
    points = COALESCE(points, 0) + points_earned,
    season_contacts = COALESCE(season_contacts, 0) + people_added,
    last_report_date = report_date
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
