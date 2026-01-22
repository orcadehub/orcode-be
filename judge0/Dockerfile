FROM judge0/judge0:1.13.0

EXPOSE $PORT

ENV RAILS_ENV=production
ENV DATABASE_URL=sqlite3::memory:
ENV REDIS_URL=redis://localhost:6379
ENV ENABLE_WAIT_RESULT=true
ENV MAX_QUEUE_SIZE=1000
ENV MAX_JOBS_IN_QUEUE=100

CMD ["sh", "-c", "bundle exec rails db:migrate && bundle exec rails server -b 0.0.0.0 -p $PORT"]