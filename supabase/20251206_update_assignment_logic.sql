-- 1. TRIGGER UPDATE: Topic matching logic
-- Function to assign active tasks based on topics
CREATE OR REPLACE FUNCTION public.assign_active_tasks_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pack RECORD;
BEGIN
  -- Iterate over active content packs valid for today
  FOR pack IN 
    SELECT id, topic FROM public.content_packs 
    WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
      AND is_active = true
  LOOP
    -- CHECK: If topic is 'Genel' OR topic is in user's profile topics
    -- Note: NEW.topics is text[]
    IF (pack.topic = 'Genel' OR pack.topic = ANY(NEW.topics)) THEN
        -- Assign if not exists
        IF NOT EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE user_id = NEW.id AND content_pack_id = pack.id
        ) THEN
            INSERT INTO public.tasks (user_id, content_pack_id, status)
            VALUES (NEW.id, pack.id, 'pending');
        END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. TRIGGER RE-CREATION (To ensure it uses the updated function)
DROP TRIGGER IF EXISTS on_profile_created_assign_tasks ON public.profiles;

CREATE TRIGGER on_profile_created_assign_tasks
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_active_tasks_to_new_user();


-- 3. RETROACTIVE FIX (Apply to existing users)
DO $$
DECLARE
  target_user RECORD;
  active_pack RECORD;
BEGIN
  -- Loop through all profiles
  FOR target_user IN SELECT id, topics FROM public.profiles LOOP
    
    -- Loop through active packs
    FOR active_pack IN 
        SELECT id, topic FROM public.content_packs 
        WHERE start_date <= CURRENT_DATE 
          AND end_date >= CURRENT_DATE 
          AND is_active = true 
    LOOP
        -- Logic: 'Genel' or Matching Topic
        IF (active_pack.topic = 'Genel' OR active_pack.topic = ANY(target_user.topics)) THEN
            -- Assign if missing
            IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE user_id = target_user.id AND content_pack_id = active_pack.id) THEN
                INSERT INTO public.tasks (user_id, content_pack_id, status) 
                VALUES (target_user.id, active_pack.id, 'pending');
            END IF;
        END IF;
    END LOOP;

  END LOOP;
END $$;
