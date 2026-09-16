-- Daily rentals become monthly leases with a residual buyout.
-- `months` replaces `days`; `end_date` stays, derived from the term.

alter table rentals rename to leases;

alter table leases rename column renter_user_id to lessee_user_id;
alter table leases rename column days to months;
alter table leases rename column rent_per_day to lease_per_month;
alter table leases rename column rent_total to lease_total;
alter table leases rename column purchase_price to buyout_price;

alter index rentals_seq_idx rename to leases_seq_idx;
alter index rentals_listing_id_idx rename to leases_listing_id_idx;
alter index rentals_renter_user_id_idx rename to leases_lessee_user_id_idx;

alter table orders rename column source_rental_id to source_lease_id;
