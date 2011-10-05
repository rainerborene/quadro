require "twitter_job"

Delayed::Worker.backend = :mongo_mapper
Delayed::Worker.destroy_failed_jobs = false
Delayed::Worker.max_run_time = 5.minutes
Delayed::Worker.delay_jobs = !Rails.env.test?
