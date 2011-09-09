require "twitter_job"

Delayed::Worker.backend = :mongo_mapper
Delayed::Worker.destroy_failed_jobs = false
Delayed::Worker.delay_jobs = !Rails.env.test?
