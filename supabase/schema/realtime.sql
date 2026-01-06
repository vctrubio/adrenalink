-- ============================================================================
-- Realtime Listeners (Event Listeners)
-- ============================================================================
-- Enable Realtime publication for booking, event, and lesson tables
-- Required for frontend real-time updates via Supabase Realtime subscriptions

ALTER PUBLICATION supabase_realtime ADD TABLE booking;
ALTER PUBLICATION supabase_realtime ADD TABLE event;
ALTER PUBLICATION supabase_realtime ADD TABLE lesson;
