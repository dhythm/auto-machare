-- Auto Machare: agricultural machinery listings become vehicles.
-- Columns are renamed rather than re-created so existing rows survive the
-- rebranding; the sample data is reloaded by `pnpm db:reset`.

alter table listings rename column hours to mileage_km;
alter table listings add column model text not null default '';
alter table listings add column inspection_expires_on text;

alter table listings rename column rent_per_day to lease_per_month;
alter table listings rename column rent_to_own to residual_lease;
alter table listings rename column rent_to_own_credit_rate to residual_lease_credit_rate;
alter table listings rename column rent_to_own_credit_cap to residual_lease_credit_cap;

alter table transport_jobs rename column item to vehicle_name;
alter table transport_jobs rename column weight to vehicle_size;
alter table transport_jobs add column vehicle_count integer not null default 1;
