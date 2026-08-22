-- auth.users delete/cascade tekshiruvi va user-scoped lease cleanup uchun.
create index if not exists hr_candidate_quota_leases_user_idx
  on private.hr_candidate_quota_leases (user_id);
