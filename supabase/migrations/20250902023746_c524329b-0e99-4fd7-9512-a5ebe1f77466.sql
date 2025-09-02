-- Delete unavailable slots with duration under 1 hour
-- This assumes time_slot format is like "HH:MM-HH:MM" (e.g., "09:00-09:30", "14:00-14:45")

DELETE FROM unavailable_slots 
WHERE time_slot IS NOT NULL 
AND time_slot ~ '^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$'
AND (
  -- Extract end time and start time, then calculate duration
  EXTRACT(EPOCH FROM (
    (SPLIT_PART(time_slot, '-', 2))::time - (SPLIT_PART(time_slot, '-', 1))::time
  )) / 3600 < 1
);