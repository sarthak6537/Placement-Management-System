-- Alter the app_user table to support the new security features

-- 1. Add the role column
ALTER TABLE app_user ADD COLUMN role VARCHAR(50);

-- 2. Populate role based on user_type (for existing data)
UPDATE app_user SET role = 'ROLE_ADMIN' WHERE user_type = 'ADMIN';
UPDATE app_user SET role = 'ROLE_PLACEMENT_OFFICER' WHERE user_type = 'PLACEMENT_OFFICER';
UPDATE app_user SET role = 'ROLE_STUDENT' WHERE user_type = 'STUDENT';

-- 3. Set the column to NOT NULL after populating existing rows
-- If there are any users without a user_type, default them to STUDENT
UPDATE app_user SET role = 'ROLE_STUDENT' WHERE role IS NULL;
ALTER TABLE app_user ALTER COLUMN role SET NOT NULL;

-- 4. Add columns for the new subclasses
ALTER TABLE app_user ADD COLUMN department VARCHAR(255); -- For PlacementOfficer
ALTER TABLE app_user ADD COLUMN student_profile_id BIGINT REFERENCES student(id); -- For StudentUser
