CREATE TABLE company (
  id bigserial PRIMARY KEY, name varchar(255) NOT NULL, industry varchar(255), website varchar(255),
  recruiter_name varchar(255), recruiter_email varchar(255), status varchar(40) NOT NULL DEFAULT 'ACTIVE'
);
CREATE TABLE job_posting (
  id bigserial PRIMARY KEY, title varchar(255) NOT NULL, description varchar(4000), eligible_batch varchar(100),
  eligible_branches varchar(255), location varchar(255), employment_type varchar(100), application_deadline date,
  status varchar(40) NOT NULL DEFAULT 'OPEN', company_id bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE
);
CREATE TABLE job_application (
  id bigserial PRIMARY KEY, student_id bigint NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  job_posting_id bigint NOT NULL REFERENCES job_posting(id) ON DELETE CASCADE, applied_on date NOT NULL DEFAULT CURRENT_DATE,
  status varchar(40) NOT NULL DEFAULT 'APPLIED', notes varchar(2000), UNIQUE(student_id, job_posting_id)
);
CREATE TABLE interview_schedule (
  id bigserial PRIMARY KEY, job_posting_id bigint NOT NULL REFERENCES job_posting(id) ON DELETE CASCADE,
  scheduled_at timestamp, round_name varchar(255), mode varchar(100), venue varchar(255), coordinator varchar(255), status varchar(40) NOT NULL DEFAULT 'SCHEDULED'
);
CREATE TABLE skill (id bigserial PRIMARY KEY, name varchar(255) NOT NULL UNIQUE, category varchar(255));
CREATE TABLE student_profile (
  id bigserial PRIMARY KEY, student_id bigint NOT NULL UNIQUE REFERENCES student(id) ON DELETE CASCADE, phone varchar(50),
  department varchar(255), batch varchar(100), cgpa double precision, resume_url varchar(1000), bio varchar(4000)
);
CREATE TABLE student_profile_skill (
  student_profile_id bigint NOT NULL REFERENCES student_profile(id) ON DELETE CASCADE,
  skill_id bigint NOT NULL REFERENCES skill(id) ON DELETE CASCADE, PRIMARY KEY(student_profile_id, skill_id)
);
