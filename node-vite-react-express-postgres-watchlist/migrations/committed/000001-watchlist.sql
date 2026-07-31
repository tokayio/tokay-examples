--! Previous: -
--! Hash: sha1:a0c827c911fae1b42c360359ef3184fe8e646f75
--! Message: watchlist

create table watchlist_titles (
  id bigint generated always as identity primary key,
  seed_key text unique,
  title text not null check (char_length(title) between 1 and 120),
  format text not null check (format in ('movie', 'show')),
  tag text not null check (tag in ('comfort', 'mystery', 'space', 'family', 'documentary')),
  watched boolean not null default false,
  added_at timestamptz not null default now()
);

create index watchlist_titles_filter_idx on watchlist_titles (watched, tag, added_at desc);
