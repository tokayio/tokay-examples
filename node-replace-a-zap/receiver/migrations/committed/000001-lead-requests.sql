--! Previous: -
--! Hash: sha1:bc7c5a411c1542c212ca272789bc44fa8301c79e
--! Message: lead requests

create table lead_requests (
  id bigint generated always as identity primary key,
  dedupe_key text not null unique,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  service text not null check (char_length(service) between 1 and 120),
  notes text not null default '' check (char_length(notes) <= 2000),
  route_key text not null check (route_key in ('events', 'priority', 'general')),
  duplicate_count integer not null default 0,
  received_at timestamptz not null default now()
);

create index lead_requests_digest_idx on lead_requests (received_at desc, route_key);
