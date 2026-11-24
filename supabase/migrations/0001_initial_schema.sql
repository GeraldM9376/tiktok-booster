-- ============================================================
-- 0001_initial_schema.sql
-- TikTok Booster — core schema, enums, tables, indexes, RLS
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type account_type      as enum ('earner', 'creator', 'admin');
create type approval_status   as enum ('pending', 'approved', 'rejected');
create type tx_type           as enum ('earning', 'referral', 'topup', 'withdrawal', 'campaign', 'rank_purchase', 'adjustment');
create type tx_status         as enum ('pending', 'completed', 'failed', 'reversed');
create type task_type         as enum ('follow', 'like', 'video_watch', 'challenge');
create type campaign_status   as enum ('active', 'paused', 'completed', 'cancelled');
create type withdrawal_status as enum ('pending', 'approved', 'rejected', 'paid');

-- ============================================================
-- SHARED IDENTITY
-- ============================================================

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  display_name  text,
  avatar_url    text,
  theme         text default 'dark',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.roles (
  id          serial primary key,
  name        text unique not null,
  description text
);

insert into public.roles (name, description) values
  ('earner',  'Can complete tasks and earn rewards'),
  ('creator', 'Can publish videos and run campaigns'),
  ('admin',   'Full platform administration');

create table public.user_roles (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role_id     int  not null references public.roles(id) on delete cascade,
  granted_at  timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index idx_user_roles_user on public.user_roles(user_id);

-- ============================================================
-- EARNER + CREATOR PROFILES
-- ============================================================

create table public.earner_profiles (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  country       text,
  age_group     text,
  approved      boolean not null default false,
  approved_at   timestamptz,
  approved_by   uuid references public.profiles(id),
  referral_code text unique,
  referred_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_earner_approved on public.earner_profiles(approved);
create index idx_earner_referral on public.earner_profiles(referral_code);

create table public.creator_profiles (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  tiktok_username   text,
  tiktok_url        text,
  bio               text,
  niche_id          int,
  avatar_url        text,
  approved          boolean not null default false,
  approved_at       timestamptz,
  approved_by       uuid references public.profiles(id),
  first_campaign_at timestamptz,
  referral_code     text unique,
  referred_by       uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_creator_approved on public.creator_profiles(approved);
create index idx_creator_niche on public.creator_profiles(niche_id);

-- ============================================================
-- RANK SYSTEM
-- ============================================================

create table public.rank_packages (
  id                 serial primary key,
  name               text unique not null,
  stars              int not null unique,
  tier_value         int not null,
  daily_follow_tasks int not null,
  daily_like_tasks   int not null,
  benefits           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

insert into public.rank_packages (name, stars, tier_value, daily_follow_tasks, daily_like_tasks) values
  ('1 Star', 1, 300, 15, 150),
  ('2 Stars', 2, 650, 20, 200),
  ('3 Stars', 3, 950, 25, 250),
  ('4 Stars', 4, 1300, 30, 300),
  ('5 Stars', 5, 1600, 35, 350),
  ('6 Stars', 6, 1950, 40, 400),
  ('7 Stars', 7, 2250, 45, 450);

create table public.user_ranks (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  rank_id       int  references public.rank_packages(id),
  purchased_at  timestamptz,
  approved_at   timestamptz,
  approved_by   uuid references public.profiles(id),
  status        approval_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- NICHES + CREATORS + VIDEOS
-- ============================================================

create table public.niches (
  id          serial primary key,
  name        text unique not null,
  description text,
  icon        text,
  created_at  timestamptz not null default now()
);

-- Dem creator marketplace (seeded with 10k)
create table public.demo_creators (
  id            uuid primary key default gen_random_uuid(),
  niche_id      int not null references public.niches(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  avatar_url    text,
  bio           text,
  follower_count bigint not null default 0,
  following_count bigint not null default 0,
  video_count   int not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  verified      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_demo_creators_niche on public.demo_creators(niche_id);
create index idx_demo_creators_followers on public.demo_creators(follower_count desc);

create table public.demo_videos (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references public.demo_creators(id) on delete cascade,
  niche_id      int  not null references public.niches(id) on delete cascade,
  title         text not null,
  description   text,
  thumbnail_url text,
  video_url     text not null,
  like_count    bigint not null default 0,
  view_count    bigint not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_demo_videos_creator on public.demo_videos(creator_id);
create index idx_demo_videos_niche on public.demo_videos(niche_id);

-- Creator's own uploaded videos
create table public.creator_videos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  niche_id      int  not null references public.niches(id),
  title         text not null,
  description   text,
  video_url     text not null,
  thumbnail_url text,
  tags          text[],
  views         bigint not null default 0,
  likes         bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_creator_videos_user on public.creator_videos(user_id);

-- ============================================================
-- CAMPAIGNS
-- ============================================================

create table public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references public.profiles(id) on delete cascade,
  video_id      uuid references public.creator_videos(id) on delete set null,
  niche_id      int  not null references public.niches(id),
  status        campaign_status not null default 'active',
  budget_credits int not null,
  engagement_target int not null default 0,
  engagement_achieved int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_campaigns_creator on public.campaigns(creator_id);
create index idx_campaigns_niche on public.campaigns(niche_id);
create index idx_campaigns_status on public.campaigns(status);

create table public.campaign_assignments (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  earner_id     uuid not null references public.profiles(id) on delete cascade,
  task_type     task_type not null,
  completed_at  timestamptz,
  reward        int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_camp_assign_earner on public.campaign_assignments(earner_id);

-- ============================================================
-- TASK COMPLETION LEDGER
-- ============================================================

create table public.completed_tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  task_type     task_type not null,
  target_id     text not null,
  reward        int not null,
  day_bucket    date not null default current_date,
  created_at    timestamptz not null default now(),
  unique (user_id, task_type, target_id, day_bucket)
);

create index idx_completed_user_day on public.completed_tasks(user_id, day_bucket);

-- ============================================================
-- WALLETS
-- ============================================================

create table public.wallets (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  available_balance bigint not null default 0 check (available_balance >= 0),
  pending_balance   bigint not null default 0 check (pending_balance >= 0),
  lifetime_earned   bigint not null default 0,
  referral_earned   bigint not null default 0,
  updated_at        timestamptz not null default now()
);

create table public.wallet_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  type           tx_type not null,
  amount         bigint not null,
  balance_before bigint not null,
  balance_after  bigint not null,
  status         tx_status not null default 'completed',
  description    text,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index idx_wallet_tx_user on public.wallet_transactions(user_id, created_at desc);

-- ============================================================
-- TOP-UPS
-- ============================================================

create table public.topup_packages (
  id          serial primary key,
  name        text unique not null,
  credits     int not null,
  price_label text,
  description text,
  features    jsonb not null default '[]'::jsonb,
  active      boolean not null default true,
  sort_order  int not null default 0
);

insert into public.topup_packages (name, credits, price_label, description, features, sort_order) values
  ('Starter', 500,  '500',  'Get started with essential credits',       '["500 credits","Basic analytics","Standard support"]', 1),
  ('Growth',  1000, '1,000','Perfect for consistent growth',            '["1,000 credits","Advanced analytics","Priority support"]', 2),
  ('Pro',     2000, '2,000','For serious creators scaling up',          '["2,000 credits","Advanced analytics","Priority support","Campaign boosts"]', 3),
  ('Premium', 3500, '3,500','Maximum reach and engagement',             '["3,500 credits","Premium analytics","24/7 support","Campaign boosts","Custom reports"]', 4),
  ('Elite',   5000, '5,000','The complete creator toolkit',             '["5,000 credits","Premium analytics","24/7 support","Campaign boosts","Custom reports","Dedicated manager"]', 5);

create table public.topup_requests (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  package_id           int  not null references public.topup_packages(id),
  requested_credits    int  not null,
  transaction_reference text not null,
  status               approval_status not null default 'pending',
  admin_comment        text,
  reviewed_by          uuid references public.profiles(id),
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now()
);

create index idx_topup_user on public.topup_requests(user_id);
create index idx_topup_status on public.topup_requests(status);

-- ============================================================
-- WITHDRAWALS
-- ============================================================

create table public.withdrawal_requests (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  amount                 bigint not null check (amount >= 500),
  qualified_referrals    int not null default 0,
  status                 withdrawal_status not null default 'pending',
  admin_comment          text,
  reviewed_by            uuid references public.profiles(id),
  reviewed_at            timestamptz,
  created_at             timestamptz not null default now()
);

create index idx_withdraw_user on public.withdrawal_requests(user_id);
create index idx_withdraw_status on public.withdrawal_requests(status);

-- ============================================================
-- REFERRALS
-- ============================================================

create table public.referral_codes (
  code       text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references public.profiles(id) on delete cascade,
  referred_id   uuid not null references public.profiles(id) on delete cascade unique,
  status        approval_status not null default 'pending',
  qualified_at  timestamptz,
  created_at    timestamptz not null default now(),
  check (referrer_id <> referred_id)
);

create index idx_referrals_referrer on public.referrals(referrer_id);

create table public.referral_rewards (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references public.profiles(id) on delete cascade,
  referred_id   uuid not null references public.profiles(id) on delete cascade,
  amount        int not null,
  created_at    timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  kind        text not null default 'info',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_notif_user on public.notifications(user_id, created_at desc);

-- ============================================================
-- SUPPORT + REVIEWS + ACHIEVEMENTS
-- ============================================================

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  message     text not null,
  status      text not null default 'open',
  response    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  reviewer_id  uuid not null references public.profiles(id) on delete cascade,
  target_id    uuid,
  target_kind  text not null,
  rating       int check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now()
);

create table public.achievements (
  id          serial primary key,
  code        text unique not null,
  name        text not null,
  description text,
  icon        text
);

create table public.user_achievements (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id int  not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ============================================================
-- AUDIT + SETTINGS + STATISTICS
-- ============================================================

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_kind text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_actor on public.audit_logs(actor_id);
create index idx_audit_created on public.audit_logs(created_at desc);

create table public.platform_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id)
);

create table public.user_daily_statistics (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  day                date not null,
  earnings           bigint not null default 0,
  tasks_completed    int not null default 0,
  follows_completed  int not null default 0,
  likes_completed    int not null default 0,
  primary key (user_id, day)
);

create table public.creator_analytics (
  user_id           uuid not null references public.profiles(id) on delete cascade,
  day               date not null,
  profile_views     bigint not null default 0,
  video_views       bigint not null default 0,
  likes             bigint not null default 0,
  followers_gained  bigint not null default 0,
  primary key (user_id, day)
);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','earner_profiles','creator_profiles','user_ranks',
    'creator_videos','campaigns','wallets','support_tickets'
  ]
  loop
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- AUTO-CREATE profile + wallet on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;

  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ATOMIC: award points to a user (task completion)
-- ============================================================

create or replace function public.award_points(
  p_user_id uuid,
  p_amount  bigint,
  p_type    tx_type,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before bigint;
  v_after  bigint;
  v_tx_id  uuid;
begin
  if p_amount <= 0 then
    raise exception 'award_points: amount must be positive';
  end if;

  select available_balance into v_before
  from public.wallets where user_id = p_user_id
  for update;

  if not found then
    raise exception 'award_points: wallet not found for %', p_user_id;
  end if;

  v_after := v_before + p_amount;

  update public.wallets
     set available_balance = v_after,
         lifetime_earned   = lifetime_earned + p_amount,
         referral_earned   = case when p_type = 'referral' then referral_earned + p_amount else referral_earned end,
         updated_at = now()
   where user_id = p_user_id;

  insert into public.wallet_transactions
    (user_id, type, amount, balance_before, balance_after, status, description, metadata)
  values
    (p_user_id, p_type, p_amount, v_before, v_after, 'completed', p_description, p_metadata)
  returning id into v_tx_id;

  return v_tx_id;
end $$;

-- ============================================================
-- ATOMIC: deduct credits (campaign activation, rank purchase)
-- ============================================================

create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount  bigint,
  p_type    tx_type,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before bigint;
  v_after  bigint;
  v_tx_id  uuid;
begin
  if p_amount <= 0 then
    raise exception 'deduct_credits: amount must be positive';
  end if;

  select available_balance into v_before
  from public.wallets where user_id = p_user_id
  for update;

  if not found then
    raise exception 'deduct_credits: wallet not found for %', p_user_id;
  end if;

  if v_before < p_amount then
    raise exception 'deduct_credits: insufficient balance (have %, need %)', v_before, p_amount;
  end if;

  v_after := v_before - p_amount;

  update public.wallets
     set available_balance = v_after,
         updated_at = now()
   where user_id = p_user_id;

  insert into public.wallet_transactions
    (user_id, type, amount, balance_before, balance_after, status, description, metadata)
  values
    (p_user_id, p_type, -p_amount, v_before, v_after, 'completed', p_description, p_metadata)
  returning id into v_tx_id;

  return v_tx_id;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.earner_profiles     enable row level security;
alter table public.creator_profiles    enable row level security;
alter table public.user_roles          enable row level security;
alter table public.user_ranks          enable row level security;
alter table public.creator_videos      enable row level security;
alter table public.campaigns           enable row level security;
alter table public.campaign_assignments enable row level security;
alter table public.completed_tasks     enable row level security;
alter table public.wallets             enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.topup_requests      enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.referral_codes      enable row level security;
alter table public.referrals           enable row level security;
alter table public.referral_rewards    enable row level security;
alter table public.notifications       enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.user_daily_statistics enable row level security;
alter table public.creator_analytics   enable row level security;
alter table public.audit_logs          enable row level security;

-- Public read: niches, rank_packages, topup_packages, demo_creators, demo_videos, achievements, platform_settings (public keys only)
alter table public.niches             enable row level security;
alter table public.rank_packages      enable row level security;
alter table public.topup_packages     enable row level security;
alter table public.demo_creators      enable row level security;
alter table public.demo_videos        enable row level security;
alter table public.achievements       enable row level security;
alter table public.platform_settings  enable row level security;

-- ---- profiles: user reads own, admin reads all ----
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---- earner_profiles ----
create policy "earner_select_own" on public.earner_profiles
  for select using (auth.uid() = user_id);
create policy "earner_insert_own" on public.earner_profiles
  for insert with check (auth.uid() = user_id);
create policy "earner_update_own" on public.earner_profiles
  for update using (auth.uid() = user_id);

-- ---- creator_profiles ----
create policy "creator_select_own" on public.creator_profiles
  for select using (auth.uid() = user_id);
create policy "creator_insert_own" on public.creator_profiles
  for insert with check (auth.uid() = user_id);
create policy "creator_update_own" on public.creator_profiles
  for update using (auth.uid() = user_id);

-- ---- user_roles ----
create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id);

-- ---- user_ranks ----
create policy "user_ranks_select_own" on public.user_ranks
  for select using (auth.uid() = user_id);

-- ---- creator_videos ----
create policy "creator_videos_select_own" on public.creator_videos
  for select using (auth.uid() = user_id);
create policy "creator_videos_crud_own" on public.creator_videos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- campaigns ----
create policy "campaigns_select_own" on public.campaigns
  for select using (auth.uid() = creator_id);
create policy "campaigns_crud_own" on public.campaigns
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- ---- campaign_assignments ----
create policy "camp_assign_select_own" on public.campaign_assignments
  for select using (auth.uid() = earner_id);

-- ---- completed_tasks ----
create policy "completed_tasks_select_own" on public.completed_tasks
  for select using (auth.uid() = user_id);

-- ---- wallets ----
create policy "wallets_select_own" on public.wallets
  for select using (auth.uid() = user_id);

-- ---- wallet_transactions ----
create policy "wallet_tx_select_own" on public.wallet_transactions
  for select using (auth.uid() = user_id);

-- ---- topup_requests ----
create policy "topup_select_own" on public.topup_requests
  for select using (auth.uid() = user_id);
create policy "topup_insert_own" on public.topup_requests
  for insert with check (auth.uid() = user_id);

-- ---- withdrawal_requests ----
create policy "withdraw_select_own" on public.withdrawal_requests
  for select using (auth.uid() = user_id);
create policy "withdraw_insert_own" on public.withdrawal_requests
  for insert with check (auth.uid() = user_id);

-- ---- referral_codes ----
create policy "refcode_select_own" on public.referral_codes
  for select using (auth.uid() = user_id);

-- ---- referrals ----
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- ---- referral_rewards ----
create policy "refreward_select_own" on public.referral_rewards
  for select using (auth.uid() = referrer_id);

-- ---- notifications ----
create policy "notif_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notif_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- ---- support_tickets ----
create policy "tickets_select_own" on public.support_tickets
  for select using (auth.uid() = user_id);
create policy "tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = user_id);

-- ---- user_daily_statistics ----
create policy "stats_select_own" on public.user_daily_statistics
  for select using (auth.uid() = user_id);

-- ---- creator_analytics ----
create policy "canalytics_select_own" on public.creator_analytics
  for select using (auth.uid() = user_id);

-- ---- audit_logs (read-only to admins via service role, no direct select) ----

-- ---- Public reads ----
create policy "niches_read_all" on public.niches for select using (true);
create policy "rank_packages_read_all" on public.rank_packages for select using (true);
create policy "topup_packages_read_all" on public.topup_packages for select using (true);
create policy "demo_creators_read_all" on public.demo_creators for select using (true);
create policy "demo_videos_read_all" on public.demo_videos for select using (true);
create policy "achievements_read_all" on public.achievements for select using (true);
create policy "platform_settings_read_all" on public.platform_settings for select using (true);