--! Previous: -
--! Hash: sha1:0177d26233f3583abbbe8a340f5cf79052e796bd
--! Message: launch board

create table launch_tasks (
  id bigint generated always as identity primary key,
  seed_key text unique,
  title text not null check (char_length(title) between 1 and 120),
  tag text not null check (tag in ('permits', 'kitchen', 'marketing')),
  due_date date not null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index launch_tasks_status_due_idx on launch_tasks (status, due_date, id);
create index launch_tasks_tag_idx on launch_tasks (tag);
