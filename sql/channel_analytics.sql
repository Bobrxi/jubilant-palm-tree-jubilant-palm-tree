-- Run this once in Supabase → SQL Editor.
-- Powers the dashboard's subscribers/views totals, per-channel stats, top
-- performers, and time-series graphs. One upserted row per channel per day.

create table if not exists channel_analytics (
  channel_id      text    not null,
  channel         text,
  date            date    not null,
  views           bigint  default 0,   -- daily, from the Analytics API
  minutes_watched bigint  default 0,   -- daily
  subs_gained     integer default 0,   -- daily
  subs_lost       integer default 0,   -- daily
  subs_total      bigint,              -- current snapshot (today's row), Data API
  views_total     bigint,              -- current snapshot (today's row)
  video_count     integer,             -- current snapshot (today's row)
  updated_at      timestamptz default now(),
  primary key (channel_id, date)       -- lets merge-duplicates upsert a day cleanly
);

-- The dashboard + laptop both use the service_role key, which bypasses RLS, so
-- no policies are needed (matching the existing channel_status / events tables).
